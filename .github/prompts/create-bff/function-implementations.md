# BFF Function Implementations

Complete source code for all Azure Function endpoints. Each function follows the same pattern: handle preflight, check CSRF (state-changing only), do the work, return response with CORS headers and cookies.

## auth-login.ts and auth-callback.ts — GET /api/auth/login and GET /api/auth/callback

The login endpoint accepts a relative `returnUrl`, generates state and PKCE values, seals the OAuth transaction into a short-lived HttpOnly cookie, and redirects to Keycloak. The callback validates state, exchanges the authorization code with `grant_type=authorization_code` and the `code_verifier`, seals the resulting tokens into the existing session cookie, and redirects to the original return URL. The BFF never accepts or handles a username or password.

```typescript
import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { authenticateUser } from '../lib/keycloak.js';
import { sealSession, sessionCookie } from '../lib/session.js';
import { checkCsrf } from '../lib/csrf.js';
import { corsHeaders, handlePreflight } from '../lib/cors.js';
import { decodeJwt } from 'jose';

async function authLogin(request: HttpRequest): Promise<HttpResponseInit> {
  const preflight = handlePreflight(request);
  if (preflight) return preflight;

  const csrfError = checkCsrf(request);
  if (csrfError) return { ...csrfError, headers: corsHeaders };

  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };
    const { username, password } = body;

    if (!username || !password) {
      return {
        status: 400,
        jsonBody: { error: 'Username and password are required' },
        headers: corsHeaders,
      };
    }

    const tokens = await authenticateUser(username, password);
    const sealed = await sealSession({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    });

    const claims = decodeJwt(tokens.access_token);

    return {
      status: 200,
      jsonBody: {
        isAuthenticated: true,
        user: {
          preferred_username: claims.preferred_username,
          email: claims.email,
          name: claims.name,
          roles: (claims as Record<string, unknown>).realm_access
            ? (
                (claims as Record<string, unknown>).realm_access as {
                  roles: string[];
                }
              ).roles
            : [],
        },
      },
      headers: corsHeaders,
      cookies: [sessionCookie(sealed)],
    };
  } catch (error) {
    return {
      status: 401,
      jsonBody: {
        error: error instanceof Error ? error.message : 'Authentication failed',
      },
      headers: corsHeaders,
    };
  }
}

app.http('auth-login', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'auth/login',
  handler: authLogin,
});
```

## auth-logout.ts — POST /api/auth/logout

Revokes the refresh token at Keycloak (best-effort — errors are swallowed so logout always succeeds), then clears the session cookie.

```typescript
import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { parseCookie, unsealSession, clearSessionCookieObj } from '../lib/session.js';
import { revokeToken } from '../lib/keycloak.js';
import { checkCsrf } from '../lib/csrf.js';
import { corsHeaders, handlePreflight } from '../lib/cors.js';

async function authLogout(request: HttpRequest): Promise<HttpResponseInit> {
  const preflight = handlePreflight(request);
  if (preflight) return preflight;

  const csrfError = checkCsrf(request);
  if (csrfError) return { ...csrfError, headers: corsHeaders };

  const cookieHeader = request.headers.get('cookie');
  const sealed = parseCookie(cookieHeader);

  if (sealed) {
    const session = await unsealSession(sealed);
    if (session) {
      await revokeToken(session.refreshToken).catch(() => {
        /* ignore */
      });
    }
  }

  return {
    status: 200,
    jsonBody: { isAuthenticated: false },
    headers: corsHeaders,
    cookies: [clearSessionCookieObj()],
  };
}

app.http('auth-logout', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'auth/logout',
  handler: authLogout,
});
```

## auth-me.ts — GET /api/auth/me

Returns the current authentication status and user claims. If the session is expired, attempts a transparent token refresh. No CSRF check (GET request).

```typescript
import { app, Cookie, HttpRequest, HttpResponseInit } from '@azure/functions';
import {
  parseCookie,
  unsealSession,
  isSessionExpired,
  sealSession,
  sessionCookie,
  clearSessionCookieObj,
} from '../lib/session.js';
import { refreshTokens } from '../lib/keycloak.js';
import { corsHeaders, handlePreflight } from '../lib/cors.js';
import { decodeJwt } from 'jose';

async function authMe(request: HttpRequest): Promise<HttpResponseInit> {
  const preflight = handlePreflight(request);
  if (preflight) return preflight;

  const cookieHeader = request.headers.get('cookie');
  const sealed = parseCookie(cookieHeader);

  if (!sealed) {
    return {
      status: 200,
      jsonBody: { isAuthenticated: false, user: null },
      headers: corsHeaders,
    };
  }

  let session = await unsealSession(sealed);
  if (!session) {
    return {
      status: 200,
      jsonBody: { isAuthenticated: false, user: null },
      headers: corsHeaders,
      cookies: [clearSessionCookieObj()],
    };
  }

  const extraCookies: Cookie[] = [];

  if (isSessionExpired(session)) {
    try {
      const tokens = await refreshTokens(session.refreshToken);
      session = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
      };
      const newSealed = await sealSession(session);
      extraCookies.push(sessionCookie(newSealed));
    } catch {
      return {
        status: 200,
        jsonBody: { isAuthenticated: false, user: null },
        headers: corsHeaders,
        cookies: [clearSessionCookieObj()],
      };
    }
  }

  const claims = decodeJwt(session.accessToken);

  return {
    status: 200,
    jsonBody: {
      isAuthenticated: true,
      user: {
        preferred_username: claims.preferred_username,
        email: claims.email,
        name: claims.name,
        roles: (claims as Record<string, unknown>).realm_access
          ? (
              (claims as Record<string, unknown>).realm_access as {
                roles: string[];
              }
            ).roles
          : [],
      },
    },
    headers: corsHeaders,
    cookies: extraCookies.length > 0 ? extraCookies : undefined,
  };
}

app.http('auth-me', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'auth/me',
  handler: authMe,
});
```

## auth-refresh.ts — POST /api/auth/refresh

Explicit token refresh endpoint. The frontend can call this proactively to renew the session before it expires.

```typescript
import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import {
  parseCookie,
  unsealSession,
  sealSession,
  sessionCookie,
  clearSessionCookieObj,
} from '../lib/session.js';
import { refreshTokens } from '../lib/keycloak.js';
import { checkCsrf } from '../lib/csrf.js';
import { corsHeaders, handlePreflight } from '../lib/cors.js';

async function authRefresh(request: HttpRequest): Promise<HttpResponseInit> {
  const preflight = handlePreflight(request);
  if (preflight) return preflight;

  const csrfError = checkCsrf(request);
  if (csrfError) return { ...csrfError, headers: corsHeaders };

  const cookieHeader = request.headers.get('cookie');
  const sealed = parseCookie(cookieHeader);

  if (!sealed) {
    return {
      status: 401,
      jsonBody: { error: 'No session' },
      headers: corsHeaders,
    };
  }

  const session = await unsealSession(sealed);
  if (!session) {
    return {
      status: 401,
      jsonBody: { error: 'Invalid session' },
      headers: corsHeaders,
    };
  }

  try {
    const tokens = await refreshTokens(session.refreshToken);
    const newSealed = await sealSession({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    });

    return {
      status: 200,
      jsonBody: { refreshed: true },
      headers: corsHeaders,
      cookies: [sessionCookie(newSealed)],
    };
  } catch {
    return {
      status: 401,
      jsonBody: { error: 'Refresh failed' },
      headers: corsHeaders,
      cookies: [clearSessionCookieObj()],
    };
  }
}

app.http('auth-refresh', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'auth/refresh',
  handler: authRefresh,
});
```

## Proxy endpoints

All proxy endpoints follow the same pattern. Here are examples for common resource types.

### proxy-entries.ts — GET/POST /api/entries

Handles both read (GET, public) and create (POST, auth + CSRF required) on the same route. Two functions cannot share the same route in Azure Functions, so both methods are in one file.

```typescript
import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { proxyToBackend } from '../lib/proxy.js';
import { checkCsrf } from '../lib/csrf.js';
import { corsHeaders, handlePreflight } from '../lib/cors.js';

async function proxyEntries(request: HttpRequest): Promise<HttpResponseInit> {
  const preflight = handlePreflight(request);
  if (preflight) return preflight;

  if (request.method === 'POST') {
    const csrfError = checkCsrf(request);
    if (csrfError) return { ...csrfError, headers: corsHeaders };
  }

  const result = await proxyToBackend(request, '/entries', request.method);

  return {
    status: result.status,
    jsonBody: result.body,
    headers: corsHeaders,
    cookies: result.cookies.length > 0 ? result.cookies : undefined,
  };
}

app.http('proxy-entries', {
  methods: ['GET', 'POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'entries',
  handler: proxyEntries,
});
```

### proxy-entry-by-id.ts — GET /api/entries/{id}

Route parameter with type constraint. The `{id:int}` ensures only numeric IDs match.

```typescript
import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { proxyToBackend } from '../lib/proxy.js';
import { corsHeaders, handlePreflight } from '../lib/cors.js';

async function proxyEntryById(request: HttpRequest): Promise<HttpResponseInit> {
  const preflight = handlePreflight(request);
  if (preflight) return preflight;

  const id = request.params.id;
  const result = await proxyToBackend(request, '/entries/' + id, 'GET');

  return {
    status: result.status,
    jsonBody: result.body,
    headers: corsHeaders,
    cookies: result.cookies.length > 0 ? result.cookies : undefined,
  };
}

app.http('proxy-entry-by-id', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'entries/{id:int}',
  handler: proxyEntryById,
});
```

### proxy-like.ts — PUT /api/entries/{id}/like

State-changing operation with CSRF check. Note CORS headers are spread into the CSRF error response — without this, the browser blocks the 403 entirely. The BFF route (`/like`) maps to a different backend path (`/like-info`) — adapt this mapping to your backend's actual API paths.

```typescript
import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { proxyToBackend } from '../lib/proxy.js';
import { corsHeaders, handlePreflight } from '../lib/cors.js';
import { checkCsrf } from '../lib/csrf.js';

async function proxyLike(request: HttpRequest): Promise<HttpResponseInit> {
  const preflight = handlePreflight(request);
  if (preflight) return preflight;

  const csrf = checkCsrf(request);
  if (csrf) return { ...csrf, headers: corsHeaders };

  const id = request.params.id;
  const result = await proxyToBackend(request, '/entries/' + id + '/like-info', 'PUT');

  return {
    status: result.status,
    jsonBody: result.body,
    headers: corsHeaders,
    cookies: result.cookies.length > 0 ? result.cookies : undefined,
  };
}

app.http('proxy-like', {
  methods: ['PUT', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'entries/{id:int}/like',
  handler: proxyLike,
});
```

### proxy-comment.ts — POST /api/entries/{id}/comments

```typescript
import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { proxyToBackend } from '../lib/proxy.js';
import { corsHeaders, handlePreflight } from '../lib/cors.js';
import { checkCsrf } from '../lib/csrf.js';

async function proxyComment(request: HttpRequest): Promise<HttpResponseInit> {
  const preflight = handlePreflight(request);
  if (preflight) return preflight;

  const csrf = checkCsrf(request);
  if (csrf) return { ...csrf, headers: corsHeaders };

  const id = request.params.id;
  const result = await proxyToBackend(request, '/entries/' + id + '/comments', 'POST');

  return {
    status: result.status,
    jsonBody: result.body,
    headers: corsHeaders,
    cookies: result.cookies.length > 0 ? result.cookies : undefined,
  };
}

app.http('proxy-comment', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'entries/{id:int}/comments',
  handler: proxyComment,
});
```

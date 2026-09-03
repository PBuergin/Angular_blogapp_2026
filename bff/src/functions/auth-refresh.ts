import { app, HttpRequest, HttpResponseInit } from '@azure/functions';

import {
  clearSessionCookieObj,
  parseCookie,
  sealSession,
  sessionCookie,
  unsealSession,
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

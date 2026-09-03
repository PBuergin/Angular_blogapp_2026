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
        // best effort
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

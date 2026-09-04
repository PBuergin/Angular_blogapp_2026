import { app, HttpRequest, HttpResponseInit } from '@azure/functions';

import { clearSessionCookieObj, parseCookie, unsealSession } from '../lib/session.js';
import { revokeToken } from '../lib/keycloak.js';
import { checkCsrf } from '../lib/csrf.js';
import { corsHeaders, handlePreflight } from '../lib/cors.js';

async function authLogout(request: HttpRequest): Promise<HttpResponseInit> {
  const preflight = handlePreflight(request);
  if (preflight) {
    return preflight;
  }

  const csrfError = checkCsrf(request);
  if (csrfError) {
    return { ...csrfError, headers: corsHeaders };
  }

  const cookieHeader = request.headers.get('cookie');
  const sealed = parseCookie(cookieHeader);

  if (sealed) {
    const session = await unsealSession(sealed);
    if (session) {
      await revokeToken(session.refreshToken).catch(() => undefined);
    }
  }

  return {
    status: 200,
    jsonBody: { logoutUrl: '/' },
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

import { app, HttpRequest, HttpResponseInit } from '@azure/functions';

import { corsHeaders, handlePreflight } from '../lib/cors.js';
import {
  clearOAuthStateCookie,
  parseOAuthStateCookie,
  sealSession,
  sessionCookie,
  unsealOAuthState,
} from '../lib/session.js';
import { exchangeAuthorizationCode } from '../lib/keycloak.js';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'http://localhost:4200';

async function authCallback(request: HttpRequest): Promise<HttpResponseInit> {
  const preflight = handlePreflight(request);
  if (preflight) {
    return preflight;
  }

  const code = request.query.get('code');
  const stateParam = request.query.get('state');
  const cookieHeader = request.headers.get('cookie');
  const sealedState = parseOAuthStateCookie(cookieHeader);

  if (!code || !stateParam || !sealedState) {
    return {
      status: 400,
      jsonBody: { error: 'Missing OAuth callback data' },
      headers: corsHeaders,
      cookies: [clearOAuthStateCookie()],
    };
  }

  const oauthState = await unsealOAuthState(sealedState);

  if (!oauthState || oauthState.state !== stateParam) {
    return {
      status: 400,
      jsonBody: { error: 'Invalid OAuth state' },
      headers: corsHeaders,
      cookies: [clearOAuthStateCookie()],
    };
  }

  try {
    const tokens = await exchangeAuthorizationCode(
      code,
      oauthState.codeVerifier,
      `${ALLOWED_ORIGIN}/api/auth/callback`,
    );

    const sealedSession = await sealSession({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    });

    return {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: oauthState.returnUrl || '/',
      },
      cookies: [sessionCookie(sealedSession), clearOAuthStateCookie()],
    };
  } catch {
    return {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: `${ALLOWED_ORIGIN}/login?error=failed`,
      },
      cookies: [clearOAuthStateCookie()],
    };
  }
}

app.http('auth-callback', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'auth/callback',
  handler: authCallback,
});

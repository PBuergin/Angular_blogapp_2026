import { app, HttpRequest, HttpResponseInit } from '@azure/functions';

import { exchangeAuthorizationCode } from '../lib/keycloak.js';
import {
  clearOAuthStateCookie,
  parseOAuthStateCookie,
  sealSession,
  sessionCookie,
  unsealOAuthState,
} from '../lib/session.js';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN!;
const CALLBACK_URL = `${ALLOWED_ORIGIN}/api/auth/callback`;

function redirect(returnUrl: string, error?: string): HttpResponseInit {
  const target = new URL(returnUrl, ALLOWED_ORIGIN);

  if (error) {
    target.searchParams.set('error', error);
  }

  return {
    status: 302,
    headers: {
      Location: `${target.pathname}${target.search}${target.hash}`,
    },
    cookies: [clearOAuthStateCookie()],
  };
}

async function authCallback(request: HttpRequest): Promise<HttpResponseInit> {
  const stateCookie = parseOAuthStateCookie(request.headers.get('cookie'));

  const transaction = stateCookie ? await unsealOAuthState(stateCookie) : null;

  const state = request.query.get('state');

  if (!transaction || !state || state !== transaction.state) {
    return {
      status: 400,
      jsonBody: {
        error: 'Invalid OAuth state',
      },
    };
  }

  const providerError = request.query.get('error');

  if (providerError) {
    return redirect(transaction.returnUrl, providerError);
  }

  const code = request.query.get('code');

  if (!code) {
    return redirect(transaction.returnUrl, 'failed');
  }

  try {
    const tokens = await exchangeAuthorizationCode(code, transaction.codeVerifier, CALLBACK_URL);

    const sealed = await sealSession({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    });

    return {
      ...redirect(transaction.returnUrl),
      cookies: [clearOAuthStateCookie(), sessionCookie(sealed)],
    };
  } catch {
    return redirect(transaction.returnUrl, 'failed');
  }
}

app.http('auth-callback', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/callback',
  handler: authCallback,
});

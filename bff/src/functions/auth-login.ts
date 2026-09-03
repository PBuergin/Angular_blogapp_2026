import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { createHash, randomBytes } from 'node:crypto';

import { oauthStateCookie, sealOAuthState } from '../lib/session.js';
import { corsHeaders } from '../lib/cors.js';

const KEYCLOAK_URL = process.env.KEYCLOAK_URL!;
const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID!;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN!;

const CALLBACK_URL = `${ALLOWED_ORIGIN}/api/auth/callback`;

function base64Url(value: Buffer): string {
  return value.toString('base64url');
}

function safeReturnUrl(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }

  return value;
}

async function authLogin(request: HttpRequest): Promise<HttpResponseInit> {
  const returnUrl = safeReturnUrl(request.query.get('returnUrl'));

  const state = base64Url(randomBytes(32));
  const codeVerifier = base64Url(randomBytes(32));

  const codeChallenge = base64Url(createHash('sha256').update(codeVerifier).digest());

  const sealedState = await sealOAuthState({
    state,
    codeVerifier,
    returnUrl,
  });

  const authorizationUrl = new URL(`${KEYCLOAK_URL}/protocol/openid-connect/auth`);

  authorizationUrl.search = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: CALLBACK_URL,
    response_type: 'code',
    scope: 'openid profile email offline_access',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  }).toString();

  return {
    status: 302,
    headers: {
      ...corsHeaders,
      Location: authorizationUrl.toString(),
    },
    cookies: [oauthStateCookie(sealedState)],
  };
}

app.http('auth-login', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/login',
  handler: authLogin,
});

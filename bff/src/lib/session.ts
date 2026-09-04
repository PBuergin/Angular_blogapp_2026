import * as Iron from '@hapi/iron';
import type { Cookie } from '@azure/functions';

const SESSION_SECRET = process.env.SESSION_SECRET!;
const COOKIE_NAME = '__session';
const OAUTH_STATE_COOKIE_NAME = '__oauth_state';
const COOKIE_SECURE =
  process.env.NODE_ENV === 'production' ||
  process.env.ALLOWED_ORIGIN?.startsWith('https://') === true;

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface OAuthStateData {
  state: string;
  codeVerifier: string;
  returnUrl: string;
}

export async function sealSession(data: SessionData): Promise<string> {
  return Iron.seal(data, SESSION_SECRET, Iron.defaults);
}

export async function unsealSession(cookie: string): Promise<SessionData | null> {
  try {
    return (await Iron.unseal(cookie, SESSION_SECRET, Iron.defaults)) as SessionData;
  } catch {
    return null;
  }
}

export async function sealOAuthState(data: OAuthStateData): Promise<string> {
  return Iron.seal(data, SESSION_SECRET, Iron.defaults);
}

export async function unsealOAuthState(cookie: string): Promise<OAuthStateData | null> {
  try {
    return (await Iron.unseal(cookie, SESSION_SECRET, Iron.defaults)) as OAuthStateData;
  } catch {
    return null;
  }
}

export function parseCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));

  if (!match) {
    return null;
  }

  const raw = match.substring(COOKIE_NAME.length + 1);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function parseOAuthStateCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${OAUTH_STATE_COOKIE_NAME}=`));

  if (!match) {
    return null;
  }

  const raw = match.substring(OAUTH_STATE_COOKIE_NAME.length + 1);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function sessionCookie(sealed: string): Cookie {
  return {
    name: COOKIE_NAME,
    value: sealed,
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'Lax',
    path: '/',
    maxAge: 86400,
  };
}

export function oauthStateCookie(sealed: string): Cookie {
  return {
    name: OAUTH_STATE_COOKIE_NAME,
    value: sealed,
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'Lax',
    path: '/api/auth',
    maxAge: 600,
  };
}

export function clearSessionCookieObj(): Cookie {
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'Lax',
    path: '/',
    maxAge: 0,
  };
}

export function clearOAuthStateCookie(): Cookie {
  return {
    ...oauthStateCookie(''),
    maxAge: 0,
  };
}

export function isSessionExpired(session: SessionData): boolean {
  return Date.now() >= session.expiresAt;
}

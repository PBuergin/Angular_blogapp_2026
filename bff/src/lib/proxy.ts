import { Cookie, HttpRequest } from '@azure/functions';
import {
  clearSessionCookieObj,
  isSessionExpired,
  parseCookie,
  sealSession,
  sessionCookie,
  SessionData,
  unsealSession,
} from './session.js';
import { refreshTokens } from './keycloak.js';

const BLOG_BACKEND_URL = process.env.BLOG_BACKEND_URL!;

interface ProxyResult {
  status: number;
  body: unknown;
  headers: Record<string, string>;
  cookies: Cookie[];
}

export async function proxyToBackend(
  request: HttpRequest,
  path: string,
  method: string,
): Promise<ProxyResult> {
  const cookieHeader = request.headers.get('cookie');
  const sealed = parseCookie(cookieHeader);
  const responseCookies: Cookie[] = [];

  let session: SessionData | null = null;
  if (sealed) {
    session = await unsealSession(sealed);
  }

  let accessToken: string | undefined;

  if (session) {
    if (isSessionExpired(session)) {
      try {
        const tokens = await refreshTokens(session.refreshToken);
        session = {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: Date.now() + tokens.expires_in * 1000,
        };
        const newSealed = await sealSession(session);
        responseCookies.push(sessionCookie(newSealed));
      } catch {
        return {
          status: 401,
          body: { error: 'Session expired' },
          headers: {},
          cookies: [clearSessionCookieObj()],
        };
      }
    }

    accessToken = session.accessToken;
  }

  const backendHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    backendHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: backendHeaders,
  };

  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    const body = await request.text();
    if (body) {
      fetchOptions.body = body;
    }
  }

  const queryString = request.query.toString();
  const url = queryString
    ? `${BLOG_BACKEND_URL}${path}?${queryString}`
    : `${BLOG_BACKEND_URL}${path}`;
  const backendRes = await fetch(url, fetchOptions);
  const responseBody = await backendRes.json().catch(() => null);

  return {
    status: backendRes.status,
    body: responseBody,
    headers: {},
    cookies: responseCookies,
  };
}

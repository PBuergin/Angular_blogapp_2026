import { app, HttpRequest, HttpResponseInit } from '@azure/functions';

import { proxyToBackend } from '../lib/proxy.js';
import { checkCsrf } from '../lib/csrf.js';
import { corsHeaders, handlePreflight } from '../lib/cors.js';

async function proxyLike(request: HttpRequest): Promise<HttpResponseInit> {
  const preflight = handlePreflight(request);
  if (preflight) return preflight;

  const csrfError = checkCsrf(request);
  if (csrfError) return { ...csrfError, headers: corsHeaders };

  const id = request.params.id;
  const result = await proxyToBackend(request, `/entries/${id}/like-info`, 'PUT');

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

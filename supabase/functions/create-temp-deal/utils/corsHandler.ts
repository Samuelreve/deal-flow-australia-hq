
import { corsHeaders } from "../../_shared/cors.ts";

export function handleCorsRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  return null;
}

export function addCorsHeaders(responseInit: ResponseInit = {}): ResponseInit {
  return {
    ...responseInit,
    headers: {
      ...(responseInit.headers || {}),
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  };
}

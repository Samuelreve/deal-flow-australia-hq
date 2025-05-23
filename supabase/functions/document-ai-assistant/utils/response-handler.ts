
import { corsHeaders } from "../../_shared/cors.ts";
import { OperationResult } from "../types.ts";

export function createSuccessResponse(result: OperationResult): Response {
  return new Response(
    JSON.stringify({
      success: true,
      ...result
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

export function createErrorResponse(error: string, status: number = 500): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error
    }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

export function createCorsResponse(): Response {
  return new Response(null, { headers: corsHeaders });
}

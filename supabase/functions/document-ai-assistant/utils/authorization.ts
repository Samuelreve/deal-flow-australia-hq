
import { corsHeaders } from "../../_shared/cors.ts";
import { verifyDealParticipant } from "../../_shared/rbac.ts";

/**
 * Verify that a user is a participant in a specific deal
 */
export async function verifyUserDealParticipation(userId: string, dealId: string): Promise<void> {
  try {
    await verifyDealParticipant(userId, dealId);
  } catch (error) {
    console.error("Authorization error:", error);
    throw new Error(`Authorization error: ${error.message}`);
  }
}

/**
 * Create a standard error response with CORS headers
 */
export function createErrorResponse(message: string, status = 400): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

/**
 * Create a standard success response with CORS headers
 */
export function createSuccessResponse(data: Record<string, any>): Response {
  return new Response(
    JSON.stringify({
      success: true,
      ...data,
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}


import { corsHeaders } from "../_shared/cors.ts";
import { RequestPayload } from "./types.ts";
import { validateRequestPayload } from "./utils/request-validation.ts";
import { verifyUserDealParticipation, createErrorResponse, createSuccessResponse } from "./utils/authorization.ts";
import { routeOperation } from "./utils/operation-router.ts";

/**
 * Main request handler for the document AI assistant
 */
export async function handleRequest(req: Request, openai: any): Promise<Response> {
  try {
    // Parse request payload
    const payload = await req.json() as RequestPayload;
    
    // Validate request payload
    const validationError = validateRequestPayload(payload);
    if (validationError) {
      return createErrorResponse(validationError);
    }

    // Log the request details (excluding content for privacy/security)
    console.log(`Processing ${payload.operation} request for user ${payload.userId}`);

    // For operations that don't need a specific deal, skip verification
    if (!['get_deal_insights', 'deal_chat_query'].includes(payload.operation)) {
      try {
        await verifyUserDealParticipation(payload.userId, payload.dealId);
      } catch (error) {
        console.error("Authorization error:", error);
        return createErrorResponse(`Authorization error: ${error.message}`, 403);
      }
    }
    
    // For deal_chat_query, verify the user is a participant in this deal
    if (payload.operation === 'deal_chat_query') {
      try {
        await verifyUserDealParticipation(payload.userId, payload.dealId);
      } catch (error) {
        console.error("Authorization error:", error);
        return createErrorResponse(`Authorization error: ${error.message}`, 403);
      }
    }

    // Route the request to the appropriate handler
    const result = await routeOperation(payload, openai);

    // Return success response
    return createSuccessResponse(result);
  } catch (error) {
    console.error("Error processing document AI request:", error);
    return createErrorResponse(`Failed to process request: ${error.message}`, 500);
  }
}

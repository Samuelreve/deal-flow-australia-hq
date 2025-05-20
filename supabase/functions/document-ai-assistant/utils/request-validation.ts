
import { RequestPayload } from "../types.ts";

/**
 * Validate that the request contains all required fields
 */
export function validateRequestPayload(payload: Partial<RequestPayload>): string | null {
  if (!payload.operation || !payload.userId) {
    return "Missing required fields";
  }

  // For operations that require a deal ID, validate it exists
  if (!['get_deal_insights', 'deal_chat_query'].includes(payload.operation) && !payload.dealId) {
    return "Missing required dealId";
  }

  // For deal_chat_query, validate deal ID exists
  if (payload.operation === 'deal_chat_query' && !payload.dealId) {
    return "Missing required dealId for chat query";
  }

  return null;
}

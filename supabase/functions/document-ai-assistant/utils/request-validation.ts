
import { RequestValidationResult } from "../types.ts";

/**
 * Validates the request body for required fields
 */
export function validateRequest(body: any): RequestValidationResult {
  if (!body) {
    throw new Error("Missing request body");
  }

  const {
    operation,
    dealId,
    userId,
    content = "",
    documentId = "",
    documentVersionId = "",
    milestoneId = "",
    context = {}
  } = body;

  // Check for required fields
  if (!operation) {
    throw new Error("Missing required fields: operation");
  }

  if (!userId) {
    throw new Error("Missing required fields: userId");
  }

  // Different operations have different required fields
  switch (operation) {
    case "explain_clause":
      if (!content) {
        throw new Error("Missing required fields for explain_clause: content");
      }
      break;

    case "analyze_document":
    case "summarize_contract":
      if (!documentId || !documentVersionId) {
        throw new Error(`Missing required fields for ${operation}: documentId, documentVersionId`);
      }
      break;

    case "explain_milestone":
      if (!milestoneId) {
        throw new Error("Missing required fields for explain_milestone: milestoneId");
      }
      break;

    case "suggest_next_action":
    case "summarize_deal":
    case "generate_milestones":
    case "predict_deal_health":
      if (!dealId) {
        throw new Error(`Missing required fields for ${operation}: dealId`);
      }
      break;

    case "deal_chat_query":
      if (!dealId || !content) {
        throw new Error("Missing required fields for deal_chat_query: dealId, content");
      }
      break;
  }

  return {
    operation,
    dealId,
    userId,
    content,
    documentId,
    documentVersionId,
    milestoneId,
    context
  };
}

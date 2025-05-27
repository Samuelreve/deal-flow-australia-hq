
import { RequestPayload } from "../types.ts";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateRequest(payload: RequestPayload): ValidationResult {
  // Basic required fields
  if (!payload.operation) {
    return { isValid: false, error: "Missing required field: operation" };
  }

  if (!payload.dealId) {
    return { isValid: false, error: "Missing required field: dealId" };
  }

  if (!payload.userId) {
    return { isValid: false, error: "Missing required field: userId" };
  }

  return { isValid: true };
}

export function validateOperationSpecificFields(payload: RequestPayload): ValidationResult {
  const { operation, content, documentId, documentVersionId, milestoneId, dealId } = payload;

  switch (operation) {
    case "explain_clause":
      if (!content) {
        return { isValid: false, error: "Missing required field for explain_clause: content" };
      }
      break;

    case "generate_template":
      if (!content) {
        return { isValid: false, error: "Missing required field for generate_template: content" };
      }
      break;

    case "summarize_document":
      // For contract analysis, content is provided directly
      if (dealId === 'contract-analysis') {
        if (!content) {
          return { isValid: false, error: "Missing required field for summarize_document: content" };
        }
      } else {
        if (!documentId || !documentVersionId) {
          return { isValid: false, error: "Missing required parameters for summarize_document: documentId, documentVersionId" };
        }
      }
      break;

    case "explain_milestone":
      if (!milestoneId) {
        return { isValid: false, error: "Missing required field for explain_milestone: milestoneId" };
      }
      break;

    case "analyze_document":
      // For contract analysis, content is provided directly
      if (dealId === 'contract-analysis') {
        if (!content) {
          return { isValid: false, error: "Missing required field for analyze_document: content" };
        }
      } else {
        if (!documentId || !documentVersionId) {
          return { isValid: false, error: "Missing required parameters for analyze_document: documentId, documentVersionId" };
        }
      }
      break;

    case "summarize_contract":
      // For contract analysis, content is provided directly
      if (dealId === 'contract-analysis') {
        if (!content) {
          return { isValid: false, error: "Missing required field for summarize_contract: content" };
        }
      } else {
        if (!documentId || !documentVersionId) {
          return { isValid: false, error: "Missing required parameters for summarize_contract: documentId, documentVersionId" };
        }
      }
      break;

    case "deal_chat_query":
      if (!content) {
        return { isValid: false, error: "Missing required field for deal_chat_query: content" };
      }
      break;

    case "explain_contract_clause":
      if (!content) {
        return { isValid: false, error: "Missing required field for explain_contract_clause: content" };
      }
      break;

    case "suggest_next_action":
    case "generate_milestones":
    case "summarize_deal":
    case "get_deal_insights":
    case "predict_deal_health":
      // These operations don't require additional validation
      break;

    default:
      return { isValid: false, error: "Invalid operation type" };
  }

  return { isValid: true };
}

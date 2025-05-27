
import { RequestPayload } from "../types.ts";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateRequest(payload: RequestPayload): ValidationResult {
  if (!payload.operation) {
    return { isValid: false, error: "Missing operation field" };
  }

  if (!payload.userId) {
    return { isValid: false, error: "Missing userId field" };
  }

  return { isValid: true };
}

export function validateOperationSpecificFields(payload: RequestPayload): ValidationResult {
  switch (payload.operation) {
    case 'explain_clause':
      if (!payload.content) {
        return { isValid: false, error: "Missing content for explain_clause operation" };
      }
      break;

    case 'explain_milestone':
      if (!payload.milestoneId) {
        return { isValid: false, error: "Missing milestoneId for explain_milestone operation" };
      }
      if (!payload.dealId) {
        return { isValid: false, error: "Missing dealId for explain_milestone operation" };
      }
      break;

    case 'suggest_next_action':
      if (!payload.dealId) {
        return { isValid: false, error: "Missing dealId for suggest_next_action operation" };
      }
      break;

    case 'generate_milestones':
      if (!payload.dealId) {
        return { isValid: false, error: "Missing dealId for generate_milestones operation" };
      }
      if (!payload.content) {
        return { isValid: false, error: "Missing content for generate_milestones operation" };
      }
      break;

    case 'analyze_document':
      if (!payload.documentId) {
        return { isValid: false, error: "Missing documentId for analyze_document operation" };
      }
      if (!payload.documentVersionId) {
        return { isValid: false, error: "Missing documentVersionId for analyze_document operation" };
      }
      if (!payload.context?.analysisType) {
        return { isValid: false, error: "Missing analysisType in context for analyze_document operation" };
      }
      break;

    case 'summarize_document':
      if (!payload.content) {
        return { isValid: false, error: "Missing content for summarize_document operation" };
      }
      break;

    case 'summarize_version_changes':
      if (!payload.currentVersionId) {
        return { isValid: false, error: "Missing currentVersionId for summarize_version_changes operation" };
      }
      if (!payload.previousVersionId) {
        return { isValid: false, error: "Missing previousVersionId for summarize_version_changes operation" };
      }
      break;

    case 'predict_deal_health':
      if (!payload.dealId) {
        return { isValid: false, error: "Missing dealId for predict_deal_health operation" };
      }
      break;

    default:
      return { isValid: false, error: "Unknown operation type" };
  }

  return { isValid: true };
}

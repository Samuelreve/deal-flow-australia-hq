
import { RequestPayload, ValidationResult } from "../types.ts";

export function validateRequest(payload: RequestPayload): ValidationResult {
  const { operation, userId } = payload;
  
  if (!operation) {
    return {
      isValid: false,
      error: "Missing required parameter: operation"
    };
  }
  
  if (!userId) {
    return {
      isValid: false,
      error: "Missing required parameter: userId"
    };
  }
  
  return { isValid: true };
}

export function validateOperationSpecificFields(payload: RequestPayload): ValidationResult {
  const { operation, content, documentId, documentVersionId, milestoneId, dealId } = payload;
  
  switch (operation) {
    case 'explain_clause':
      if (!content) {
        return {
          isValid: false,
          error: "Missing required parameter for explain_clause: content"
        };
      }
      break;
      
    case 'analyze_document':
      if (!documentId || !documentVersionId) {
        return {
          isValid: false,
          error: "Missing required parameters for analyze_document: documentId, documentVersionId"
        };
      }
      if (!payload.context || !payload.context.analysisType) {
        return {
          isValid: false,
          error: "Missing required parameter for analyze_document: context.analysisType"
        };
      }
      break;
      
    case 'explain_milestone':
      if (!milestoneId) {
        return {
          isValid: false,
          error: "Missing required parameter for explain_milestone: milestoneId"
        };
      }
      break;
      
    case 'suggest_next_action':
    case 'summarize_deal':
    case 'generate_milestones':
    case 'predict_deal_health':
      if (!dealId) {
        return {
          isValid: false,
          error: `Missing required parameter for ${operation}: dealId`
        };
      }
      break;
      
    case 'deal_chat':
      if (!dealId || !content) {
        return {
          isValid: false,
          error: "Missing required parameters for deal_chat: dealId, content"
        };
      }
      break;
      
    case 'summarize_version_changes':
      if (!dealId || !documentId || !payload.currentVersionId || !payload.previousVersionId) {
        return {
          isValid: false,
          error: "Missing required parameters for summarize_version_changes: dealId, documentId, currentVersionId, previousVersionId"
        };
      }
      break;
  }
  
  return { isValid: true };
}

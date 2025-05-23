
export interface RequestPayload {
  operation: string;
  dealId?: string;
  documentId?: string;
  documentVersionId?: string;
  currentVersionId?: string;
  previousVersionId?: string;
  milestoneId?: string;
  content?: string;
  userId: string;
  context?: Record<string, any>;
  chatHistory?: any[];
  selectedText?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface OperationResult {
  success: boolean;
  [key: string]: any;
}

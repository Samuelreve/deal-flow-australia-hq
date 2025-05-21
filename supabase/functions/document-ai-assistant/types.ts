
export interface RequestPayload {
  operation: string;
  dealId?: string;
  documentId?: string;
  documentVersionId?: string;
  milestoneId?: string;
  content?: string;
  userId: string;
  context?: Record<string, any>;
  chatHistory?: any[];
  selectedText?: string;
}

export interface RequestValidationResult {
  operation: string;
  dealId: string;
  userId: string;
  content: string;
  documentId: string;
  documentVersionId: string;
  milestoneId: string;
  context: Record<string, any>;
}

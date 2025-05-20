
export type OperationType = 
  "explain_clause" | 
  "generate_template" | 
  "summarize_document" | 
  "explain_milestone" |
  "suggest_next_action" |
  "generate_milestones";

export interface RequestPayload {
  operation: OperationType;
  dealId: string;
  documentId?: string;
  documentVersionId?: string;
  milestoneId?: string;
  content: string;
  userId: string;
  context?: Record<string, any>;
}

// Add this type to the existing file
export interface MilestoneGenerationResponse {
  milestones: {
    name: string;
    description: string;
    order: number;
  }[];
  disclaimer: string;
}

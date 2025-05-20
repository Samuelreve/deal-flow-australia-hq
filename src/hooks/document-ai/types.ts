
/**
 * Document AI API operation types
 */
export interface DocumentAIOperation {
  operation: 'explain_clause' | 'generate_template' | 'summarize_document' | 'explain_milestone' | 'suggest_next_action' | 'generate_milestones';
  dealId: string;
  documentId?: string;
  documentVersionId?: string;
  milestoneId?: string;
  content: string;
  userId: string;
  context?: Record<string, any>;
}

/**
 * Response types for different AI operations
 */
export interface ExplanationResponse {
  explanation: string;
  disclaimer: string;
  success: boolean;
}

export interface GenerationResponse {
  template: string;
  disclaimer: string;
  success: boolean;
}

export interface SummaryResponse {
  summary: string;
  disclaimer: string;
  success: boolean;
}

export interface MilestoneExplanationResponse {
  explanation: string;
  milestone?: {
    title: string;
    status: string;
  };
  disclaimer: string;
  success: boolean;
}

export interface NextActionResponse {
  suggestion: string;
  disclaimer: string;
  success: boolean;
}

export interface MilestoneGenerationResponse {
  milestones: {
    name: string;
    description: string;
    order: number;
  }[];
  disclaimer: string;
  success: boolean;
}

/**
 * Combined type for any AI operation response
 */
export type AIOperationResponse = 
  | ExplanationResponse 
  | GenerationResponse 
  | SummaryResponse 
  | MilestoneExplanationResponse
  | NextActionResponse
  | MilestoneGenerationResponse;

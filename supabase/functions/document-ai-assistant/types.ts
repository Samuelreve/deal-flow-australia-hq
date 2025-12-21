export interface ConversationalMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConversationalState {
  phase: 'select_type' | 'gathering' | 'confirming' | 'generating' | 'complete';
  documentType: string | null;
  gatheredAnswers: Record<string, any>;
  currentQuestionIndex: number;
}

export interface RequestPayload {
  operation: 'explain_clause' | 'generate_template' | 'generate_smart_template' | 'summarize_document' | 'explain_milestone' | 'suggest_next_action' | 'generate_milestones' | 'analyze_document' | 'summarize_version_changes' | 'predict_deal_health' | 'deal_chat_query' | 'conversational_template';
  dealId?: string;
  documentId?: string;
  documentVersionId?: string;
  currentVersionId?: string;
  previousVersionId?: string;
  milestoneId?: string;
  content?: string;
  userId?: string;
  chatHistory?: any[];
  analysisType?: string;
  documentText?: string;
  // Conversational template specific
  conversationalState?: ConversationalState;
  messages?: ConversationalMessage[];
  context?: {
    analysisType?: string;
    saveAnalysis?: boolean;
    chatHistory?: any[];
    dealContext?: Record<string, any>;
    [key: string]: any;
  };
}

export interface AIResponse {
  success: boolean;
  explanation?: string;
  template?: string;
  summary?: string;
  suggestion?: string;
  analysis?: any;
  milestones?: any[];
  error?: string;
  disclaimer?: string;
  
  // Deal health prediction specific fields
  probability_of_success_percentage?: number;
  confidence_level?: string;
  prediction_reasoning?: string;
  suggested_improvements?: Array<{
    area: string;
    recommendation: string;
    impact: string;
  }>;
  
  // Deal chat specific fields
  answer?: string;
  response?: string;
  
  // Conversational template specific fields
  message?: string;
  state?: ConversationalState;
  options?: Array<{ label: string; value: string; description?: string }>;
  isComplete?: boolean;
  generatedDocument?: string;
}

// Keep the existing OperationResult type for compatibility
export type OperationResult = AIResponse;

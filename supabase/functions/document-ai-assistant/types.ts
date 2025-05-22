
// Request body for the Document AI Assistant
export interface AIAssistantRequestBody {
  operation: string;
  dealId: string;
  documentId?: string;
  documentVersionId?: string;
  currentVersionId?: string;
  previousVersionId?: string;
  milestoneId?: string;
  content?: string;
  userId?: string;
  context?: Record<string, any>;
}

// Supported AI operations
export type AIOperation = 
  | 'explain_clause' 
  | 'generate_template' 
  | 'generate_smart_template' 
  | 'summarize_document' 
  | 'explain_milestone' 
  | 'suggest_next_action' 
  | 'generate_milestones' 
  | 'analyze_document' 
  | 'summarize_version_changes'
  | 'deal_chat_query'
  | 'get_deal_insights'
  | 'predict_deal_health'
  | 'summarize_deal'
  | 'explain_contract_clause'
  | 'analyze_smart_contract'
  | 'explain_smart_contract_clause'
  | 'summarize_smart_contract';

// Response for AI operations
export interface AIAssistantResponse {
  success: boolean;
  error?: string;
  data?: any;
}

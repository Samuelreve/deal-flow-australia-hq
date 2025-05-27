
export interface RequestPayload {
  operation: 'explain_clause' | 'generate_template' | 'generate_smart_template' | 'summarize_document' | 'explain_milestone' | 'suggest_next_action' | 'generate_milestones' | 'analyze_document' | 'summarize_version_changes' | 'predict_deal_health';
  dealId?: string;
  documentId?: string;
  documentVersionId?: string;
  currentVersionId?: string;
  previousVersionId?: string;
  milestoneId?: string;
  content?: string;
  userId?: string;
  context?: {
    analysisType?: string;
    saveAnalysis?: boolean;
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
}

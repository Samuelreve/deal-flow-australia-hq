export type OperationType = 
  "explain_clause" | 
  "generate_template" | 
  "summarize_document" | 
  "explain_milestone" |
  "suggest_next_action" |
  "generate_milestones" |
  "analyze_document" |
  "summarize_deal" |
  "get_deal_insights" |
  "deal_chat_query" |
  "predict_deal_health" |
  "summarize_contract" |
  "explain_contract_clause";

export interface RequestPayload {
  operation: OperationType;
  dealId: string;
  documentId?: string;
  documentVersionId?: string;
  milestoneId?: string;
  content: string;
  userId: string;
  context?: Record<string, any>;
  chatHistory?: Array<{sender: string, content: string}>;
  selectedText?: string; // Added for explain_contract_clause
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

// Document analysis response type
export interface DocumentAnalysisResponse {
  analysis: {
    type: string;
    content: any; // Could be string or structured data depending on analysis type
  };
  disclaimer: string;
}

// Deal Summary Response Type
export interface DealSummaryResponse {
  summary: string;
  disclaimer: string;
}

// Deal Insights Response Type
export interface DealInsightsResponse {
  insightsText: string;
  portfolioHealth?: string;
  dealsNeedingAttention?: Array<{
    id: string;
    name: string;
    reason: string;
  }>;
  dealsProgressingWell?: Array<{
    id: string;
    name: string;
    reason: string;
  }>;
  keyTrends?: string[];
  recommendations?: string[];
  disclaimer: string;
}

// Deal Health Prediction Response Type
export interface DealHealthPredictionResponse {
  probability_of_success_percentage: number;
  confidence_level: "High" | "Medium" | "Low";
  prediction_reasoning: string;
  suggested_improvements: Array<{
    area: string;
    recommendation: string;
    impact: "High" | "Medium" | "Low";
  }>;
  disclaimer: string;
  success?: boolean;
  error?: string;
}

// Deal Chat Response Type
export interface DealChatResponse {
  answer: string;
  disclaimer: string;
}

// Chat Message Type
export interface ChatMessage {
  sender: 'user' | 'ai';
  content: string;
  timestamp?: Date;
}

// Smart Contract Assistant Response Types
export interface ContractSummaryResponse {
  summaryText: string;
  parties: string[];
  contractType: string;
  keyObligations: string[];
  timelines: string[];
  terminationRules: string[];
  liabilities: string[];
  disclaimer: string;
  success?: boolean;
  error?: string;
}

export interface ContractClauseExplanationResponse {
  explanation: string;
  isAmbiguous: boolean;
  ambiguityExplanation?: string;
  disclaimer: string;
  success?: boolean;
  error?: string;
}

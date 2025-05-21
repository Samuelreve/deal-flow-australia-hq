
// Types for Document AI operations

// Text explanation response
export interface ContractClauseExplanationResponse {
  explanation: string;
  isAmbiguous?: boolean;
  ambiguityExplanation?: string;
  disclaimer: string;
}

// Contract summary response
export interface ContractSummaryResponse {
  summary: string;
  analysisId?: string;
  disclaimer: string;
  parties?: string[];
  contractType?: string;
  keyObligations?: string[];
  timelines?: string[];
  terminationRules?: string[];
  liabilities?: string[];
}

// Message for chat history
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// Response from deal chat query
export interface DealChatResponse {
  answer: string;
  sources?: Array<{
    content: string;
    reference: string;
  }>;
  disclaimer: string;
}

// Deal Health Prediction Response
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

// Deal Summary Response
export interface DealSummaryResponse {
  summary: string;
  disclaimer: string;
}

// Deal Insights Response
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

// Document Analysis Response
export interface DocumentAnalysisResponse {
  analysis: {
    type: string;
    content: any;
  };
  disclaimer: string;
}

// Milestone Generation Response
export interface MilestoneGenerationResponse {
  milestones: {
    name: string;
    description: string;
    order: number;
  }[];
  disclaimer: string;
}

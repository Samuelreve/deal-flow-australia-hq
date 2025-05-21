
// Add new contract-related types

export interface ContractSummaryResponse {
  summaryText: string;
  contractType?: string;
  parties?: string[];
  keyObligations?: string[];
  timelines?: string[];
  terminationRules?: string[];
  liabilities?: string[];
  disclaimer: string;
  success?: boolean;
}

export interface ContractClauseExplanationResponse {
  explanation: string;
  isAmbiguous?: boolean;
  ambiguityExplanation?: string;
  disclaimer: string;
  success?: boolean;
}

// Add missing types referenced by other components
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface DealChatResponse {
  answer: string;
  sources?: string[];
  disclaimer: string;
  success?: boolean;
}

export interface DealHealthPredictionResponse {
  prediction: string;
  score?: number;
  factors?: string[];
  recommendation?: string;
  disclaimer: string;
  success?: boolean;
  // Adding fields that were referenced in code but not defined
  probability_of_success_percentage?: number;
  confidence_level?: string;
  prediction_reasoning?: string;
  suggested_improvements?: {
    area: string;
    recommendation: string;
    impact: "High" | "Medium" | "Low";
  }[];
}

export interface DealSummaryResponse {
  summary: string;
  disclaimer: string;
  success?: boolean;
}

export interface DealInsightsResponse {
  insights: string;
  recommendations?: string[];
  disclaimer: string;
  success?: boolean;
  // Adding field that was referenced but not defined
  insightsText?: string;
}

export interface DocumentAnalysisResponse {
  analysis: string;
  disclaimer: string;
  success?: boolean;
}

export interface MilestoneGenerationResponse {
  milestones: any[];
  disclaimer: string;
  success?: boolean;
}

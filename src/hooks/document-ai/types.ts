
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

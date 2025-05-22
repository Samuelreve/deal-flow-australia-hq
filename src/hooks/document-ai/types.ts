
// Add any missing types needed for our hooks
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface DealChatResponse {
  answer: string;
  sources?: string[];
  confidence?: number;
}

export interface DealHealthPredictionResponse {
  probability_of_success_percentage: number;
  confidence_level: string;
  prediction_reasoning: string;
  suggested_improvements: Array<{
    area: string;
    recommendation: string;
    impact: string;
  }>;
  disclaimer: string;
}

export interface ContractSummaryResponse {
  summary: string;
  key_points: string[];
  disclaimer?: string;
}

export interface ContractClauseExplanationResponse {
  explanation: string;
  implications: string[];
  isAmbiguous?: boolean;
  ambiguityExplanation?: string;
  disclaimer?: string;
}

export interface DocumentAnalysisResponse {
  analysis: {
    type: string;
    content: any;
  };
  disclaimer: string;
}

export interface DealSummaryResponse {
  summary: string;
  key_details: Record<string, any>;
  progress: {
    percentage: number;
    completed_milestones: number;
    total_milestones: number;
  };
  participants: Array<{
    role: string;
    count: number;
  }>;
  disclaimer?: string;
}

export interface DealInsightsResponse {
  insights: Array<{
    title: string;
    description: string;
    type: string;
    priority: string;
  }>;
  metrics: Record<string, any>;
  recommendations: string[];
  disclaimer?: string;
}

export interface MilestoneGenerationResponse {
  milestones: Array<{
    name: string;
    description: string;
    order: number;
  }>;
  disclaimer: string;
}

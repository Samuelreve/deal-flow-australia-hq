
// Types for document AI operations

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface DealChatResponse {
  answer: string;
  response?: string;
}

export interface HealthPrediction {
  probability_of_success_percentage: number;
  confidence_level: 'High' | 'Medium' | 'Low';
  prediction_reasoning: string;
  suggested_improvements: Array<{
    area: string;
    recommendation: string;
    impact: 'High' | 'Medium' | 'Low';
  }>;
  disclaimer: string;
}

export interface AIAnalysisResult {
  type: string;
  content: any;
  disclaimer?: string;
}

export interface DocumentSummary {
  summary: string;
  keyPoints?: string[];
  disclaimer?: string;
}

export interface MilestoneGeneration {
  milestones: Array<{
    name: string;
    description: string;
    order: number;
  }>;
  disclaimer?: string;
}

export interface ClauseExplanation {
  explanation: string;
  disclaimer?: string;
}

// Additional response types that were missing
export interface DealHealthPredictionResponse {
  probability_of_success_percentage: number;
  confidence_level: 'High' | 'Medium' | 'Low';
  prediction_reasoning: string;
  suggested_improvements: Array<{
    area: string;
    recommendation: string;
    impact: 'High' | 'Medium' | 'Low';
  }>;
  disclaimer: string;
}

export interface DealSummaryResponse {
  summary: string;
  keyPoints?: string[];
  disclaimer?: string;
}

export interface DealInsightsResponse {
  insights: Array<{
    title: string;
    description: string;
    type: 'positive' | 'negative' | 'neutral';
    priority: 'high' | 'medium' | 'low';
  }>;
  metrics?: Record<string, number>;
  recommendations: string[];
  disclaimer?: string;
}

export interface DocumentAnalysisResponse {
  analysis: {
    type: string;
    content: any;
  };
  disclaimer?: string;
}

export interface MilestoneGenerationResponse {
  milestones: Array<{
    name: string;
    description: string;
    order: number;
  }>;
  disclaimer?: string;
}

export interface ContractSummaryResponse {
  summary: string;
  keyPoints?: string[];
  disclaimer?: string;
}

export interface ContractClauseExplanationResponse {
  explanation: string;
  disclaimer?: string;
  isAmbiguous?: boolean;
}

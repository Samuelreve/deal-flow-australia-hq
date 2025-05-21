
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

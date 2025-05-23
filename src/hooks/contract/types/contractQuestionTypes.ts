
export interface QuestionHistoryItem {
  question: string;
  answer: string;
  timestamp: number;
  type: 'question' | 'analysis';
  analysisType?: string;
}

export interface DealHealthPrediction {
  prediction: string;
  confidence: number;
  factors: string[];
}

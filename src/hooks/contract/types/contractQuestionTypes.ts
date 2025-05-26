
export interface QuestionHistoryItem {
  id?: string;
  question: string;
  answer: string;
  timestamp: number;
  type: 'question' | 'analysis';
  analysisType?: string;
  isProcessing?: boolean;
}

export interface DealHealthPrediction {
  prediction: string;
  confidence: number;
  factors: string[];
}

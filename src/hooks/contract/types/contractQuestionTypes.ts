
// Re-export the standardized interface from the main types file
export { QuestionHistoryItem } from '@/types/contract';

export interface DealHealthPrediction {
  prediction: string;
  confidence: number;
  factors: string[];
}

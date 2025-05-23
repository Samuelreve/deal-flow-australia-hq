
import { DealHealthPrediction } from '../types/contractQuestionTypes';

export const generateMockAnswer = (question: string): string => {
  return `This is a simulated answer to: "${question}". In a real implementation, this would be processed by an AI service.`;
};

export const generateMockDealHealthPrediction = (dealId: string): DealHealthPrediction => {
  return {
    prediction: "Good",
    confidence: 85,
    factors: ["Timeline on track", "All documents submitted"]
  };
};

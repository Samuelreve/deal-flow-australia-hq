
export interface HealthPrediction {
  id: string;
  deal_id: string;
  user_id: string;
  probability_percentage: number;
  confidence_level: string;
  reasoning: string;
  suggested_improvements: Array<{
    area: string;
    recommendation: string;
    impact: 'low' | 'medium' | 'high';
  }>;
  created_at: string;
  updated_at: string;
}

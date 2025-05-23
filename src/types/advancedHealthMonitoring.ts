
export interface HealthPrediction {
  id: string;
  deal_id: string;
  predicted_score: number;
  prediction_date: string;
  confidence_level: number;
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  created_at: string;
}

export interface CustomHealthMetric {
  id: string;
  deal_id: string;
  user_id: string;
  metric_name: string;
  metric_weight: number;
  current_value: number;
  target_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HealthRecoveryPlan {
  id: string;
  deal_id: string;
  user_id: string;
  current_score: number;
  target_score: number;
  estimated_timeline_days?: number;
  action_items: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimated_impact: number;
    due_date?: string;
    completed: boolean;
  }>;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface HealthScoreComparison {
  id: string;
  user_id: string;
  comparison_name: string;
  deal_ids: string[];
  date_range_start: string;
  date_range_end: string;
  created_at: string;
}

export interface HealthReport {
  id: string;
  user_id: string;
  report_name: string;
  report_type: 'pdf' | 'csv' | 'json';
  deal_ids?: string[];
  date_range_start: string;
  date_range_end: string;
  report_data?: any;
  file_url?: string;
  status: 'generating' | 'completed' | 'failed';
  created_at: string;
}

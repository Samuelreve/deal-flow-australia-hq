
export interface HealthThreshold {
  id: string;
  deal_id: string;
  user_id: string;
  threshold_type: 'critical' | 'warning' | 'info';
  threshold_value: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface HealthAlert {
  id: string;
  deal_id: string;
  user_id: string;
  alert_type: 'threshold_breach' | 'score_drop' | 'improvement';
  threshold_value?: number;
  current_score: number;
  previous_score?: number;
  message: string;
  recommendations: Array<{
    area: string;
    recommendation: string;
    impact: 'low' | 'medium' | 'high';
  }>;
  is_read: boolean;
  created_at: string;
}

export interface HealthHistory {
  id: string;
  deal_id: string;
  health_score: number;
  previous_score?: number;
  change_reason?: string;
  created_at: string;
}


import { HealthPrediction, CustomHealthMetric, HealthRecoveryPlan, HealthScoreComparison, HealthReport } from '@/types/advancedHealthMonitoring';

export interface UseAdvancedHealthMonitoringReturn {
  predictions: HealthPrediction[];
  customMetrics: CustomHealthMetric[];
  recoveryPlans: HealthRecoveryPlan[];
  comparisons: HealthScoreComparison[];
  reports: HealthReport[];
  loading: boolean;
  createCustomMetric: (metric: Omit<CustomHealthMetric, 'id' | 'created_at' | 'updated_at'>) => Promise<CustomHealthMetric | null>;
  createRecoveryPlan: (plan: Omit<HealthRecoveryPlan, 'id' | 'created_at' | 'updated_at'>) => Promise<HealthRecoveryPlan | null>;
  createComparison: (comparison: Omit<HealthScoreComparison, 'id' | 'created_at'>) => Promise<HealthScoreComparison | null>;
  generateReport: (reportConfig: Omit<HealthReport, 'id' | 'created_at' | 'status' | 'report_data' | 'file_url'>) => Promise<HealthReport | null>;
  refetch: () => void;
}

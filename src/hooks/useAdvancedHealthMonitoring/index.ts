
import { useState, useEffect } from 'react';
import { usePredictions } from './usePredictions';
import { useCustomMetrics } from './useCustomMetrics';
import { useRecoveryPlans } from './useRecoveryPlans';
import { useComparisons } from './useComparisons';
import { useReports } from './useReports';
import { UseAdvancedHealthMonitoringReturn } from './types';

export const useAdvancedHealthMonitoring = (userId?: string): UseAdvancedHealthMonitoringReturn => {
  const [loading, setLoading] = useState(true);

  const { predictions, fetchPredictions } = usePredictions(userId);
  const { customMetrics, fetchCustomMetrics, createCustomMetric } = useCustomMetrics(userId);
  const { recoveryPlans, fetchRecoveryPlans, createRecoveryPlan } = useRecoveryPlans(userId);
  const { comparisons, fetchComparisons, createComparison } = useComparisons(userId);
  const { reports, fetchReports, generateReport } = useReports(userId);

  const refetch = () => {
    fetchPredictions();
    fetchCustomMetrics();
    fetchRecoveryPlans();
    fetchComparisons();
    fetchReports();
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPredictions(),
        fetchCustomMetrics(),
        fetchRecoveryPlans(),
        fetchComparisons(),
        fetchReports()
      ]);
      setLoading(false);
    };

    if (userId) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [userId]);

  return {
    predictions,
    customMetrics,
    recoveryPlans,
    comparisons,
    reports,
    loading,
    createCustomMetric,
    createRecoveryPlan,
    createComparison,
    generateReport,
    refetch
  };
};

export * from './types';

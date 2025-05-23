
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  HealthPrediction, 
  CustomHealthMetric, 
  HealthRecoveryPlan, 
  HealthScoreComparison, 
  HealthReport 
} from '@/types/advancedHealthMonitoring';

export const useAdvancedHealthMonitoring = (userId?: string) => {
  const [predictions, setPredictions] = useState<HealthPrediction[]>([]);
  const [customMetrics, setCustomMetrics] = useState<CustomHealthMetric[]>([]);
  const [recoveryPlans, setRecoveryPlans] = useState<HealthRecoveryPlan[]>([]);
  const [comparisons, setComparisons] = useState<HealthScoreComparison[]>([]);
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch health predictions for user's deals
  const fetchPredictions = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('deal_health_predictions')
        .select(`
          *,
          deals!inner(
            id,
            title,
            deal_participants!inner(user_id)
          )
        `)
        .eq('deals.deal_participants.user_id', userId)
        .order('prediction_date', { ascending: false });

      if (error) throw error;
      setPredictions(data || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast.error('Failed to load health predictions');
    }
  };

  // Fetch custom metrics
  const fetchCustomMetrics = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('custom_health_metrics')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomMetrics(data || []);
    } catch (error) {
      console.error('Error fetching custom metrics:', error);
      toast.error('Failed to load custom metrics');
    }
  };

  // Fetch recovery plans
  const fetchRecoveryPlans = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('health_recovery_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecoveryPlans(data || []);
    } catch (error) {
      console.error('Error fetching recovery plans:', error);
      toast.error('Failed to load recovery plans');
    }
  };

  // Fetch comparisons
  const fetchComparisons = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('health_score_comparisons')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComparisons(data || []);
    } catch (error) {
      console.error('Error fetching comparisons:', error);
      toast.error('Failed to load comparisons');
    }
  };

  // Fetch reports
  const fetchReports = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('health_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    }
  };

  // Create custom metric
  const createCustomMetric = async (metric: Omit<CustomHealthMetric, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('custom_health_metrics')
        .insert([metric])
        .select()
        .single();

      if (error) throw error;
      
      setCustomMetrics(prev => [data, ...prev]);
      toast.success('Custom metric created successfully');
      return data;
    } catch (error) {
      console.error('Error creating custom metric:', error);
      toast.error('Failed to create custom metric');
      return null;
    }
  };

  // Create recovery plan
  const createRecoveryPlan = async (plan: Omit<HealthRecoveryPlan, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('health_recovery_plans')
        .insert([plan])
        .select()
        .single();

      if (error) throw error;
      
      setRecoveryPlans(prev => [data, ...prev]);
      toast.success('Recovery plan created successfully');
      return data;
    } catch (error) {
      console.error('Error creating recovery plan:', error);
      toast.error('Failed to create recovery plan');
      return null;
    }
  };

  // Create comparison
  const createComparison = async (comparison: Omit<HealthScoreComparison, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('health_score_comparisons')
        .insert([comparison])
        .select()
        .single();

      if (error) throw error;
      
      setComparisons(prev => [data, ...prev]);
      toast.success('Comparison created successfully');
      return data;
    } catch (error) {
      console.error('Error creating comparison:', error);
      toast.error('Failed to create comparison');
      return null;
    }
  };

  // Generate report
  const generateReport = async (reportConfig: Omit<HealthReport, 'id' | 'created_at' | 'status' | 'report_data' | 'file_url'>) => {
    try {
      const { data, error } = await supabase
        .from('health_reports')
        .insert([{
          ...reportConfig,
          status: 'generating' as const
        }])
        .select()
        .single();

      if (error) throw error;
      
      setReports(prev => [data, ...prev]);
      toast.success('Report generation started');
      
      // Simulate report generation (in a real app, this would be handled by a background job)
      setTimeout(async () => {
        const mockReportData = {
          summary: 'Health report generated successfully',
          deal_count: reportConfig.deal_ids?.length || 0,
          generated_at: new Date().toISOString()
        };
        
        await supabase
          .from('health_reports')
          .update({
            status: 'completed',
            report_data: mockReportData,
            file_url: `/reports/${data.id}.${reportConfig.report_type}`
          })
          .eq('id', data.id);
          
        fetchReports();
        toast.success('Report generated successfully');
      }, 3000);
      
      return data;
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
      return null;
    }
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

    fetchAllData();
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
    refetch: () => {
      fetchPredictions();
      fetchCustomMetrics();
      fetchRecoveryPlans();
      fetchComparisons();
      fetchReports();
    }
  };
};

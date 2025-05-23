
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
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      // Map database fields to the expected HealthPrediction structure
      const formattedPredictions: HealthPrediction[] = (data || []).map(item => ({
        id: item.id,
        deal_id: item.deal_id,
        predicted_score: item.probability_percentage,
        prediction_date: item.created_at,
        confidence_level: parseFloat(item.confidence_level) || 0.5,
        factors: Array.isArray(item.suggested_improvements) 
          ? (item.suggested_improvements as any[]).map((imp: any) => ({
              factor: imp.area || 'Unknown factor',
              impact: imp.impact === 'high' ? 15 : imp.impact === 'medium' ? 10 : 5,
              description: imp.recommendation || 'No description'
            }))
          : [],
        created_at: item.created_at
      }));

      setPredictions(formattedPredictions);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast.error('Failed to load health predictions');
    }
  };

  // Fetch custom metrics using RPC function
  const fetchCustomMetrics = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase.rpc('get_custom_health_metrics', {
        p_user_id: userId
      });

      if (error) {
        console.error('RPC error:', error);
        setCustomMetrics([]);
        return;
      }
      
      // Format the data to match our CustomHealthMetric type
      const formattedMetrics: CustomHealthMetric[] = (data || []).map((metric: any) => ({
        id: metric.id,
        deal_id: metric.deal_id,
        user_id: metric.user_id,
        metric_name: metric.metric_name,
        metric_weight: metric.metric_weight,
        current_value: metric.current_value,
        target_value: metric.target_value,
        is_active: metric.is_active,
        created_at: metric.created_at,
        updated_at: metric.updated_at
      }));
      
      setCustomMetrics(formattedMetrics);
    } catch (error) {
      console.error('Error fetching custom metrics:', error);
      toast.error('Failed to load custom metrics');
      setCustomMetrics([]);
    }
  };

  // Fetch recovery plans using RPC function
  const fetchRecoveryPlans = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase.rpc('get_recovery_plans', {
        p_user_id: userId
      });

      if (error) {
        console.error('RPC error:', error);
        setRecoveryPlans([]);
        return;
      }
      
      // Format the data to match our HealthRecoveryPlan type
      const formattedPlans: HealthRecoveryPlan[] = (data || []).map((plan: any) => ({
        id: plan.id,
        deal_id: plan.deal_id,
        user_id: plan.user_id,
        current_score: plan.current_score,
        target_score: plan.target_score,
        estimated_timeline_days: plan.estimated_timeline_days,
        action_items: Array.isArray(plan.action_items) ? plan.action_items : [],
        status: plan.status as 'active' | 'completed' | 'cancelled',
        created_at: plan.created_at,
        updated_at: plan.updated_at
      }));
      
      setRecoveryPlans(formattedPlans);
    } catch (error) {
      console.error('Error fetching recovery plans:', error);
      toast.error('Failed to load recovery plans');
      setRecoveryPlans([]);
    }
  };

  // Fetch comparisons using RPC function
  const fetchComparisons = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase.rpc('get_health_comparisons', {
        p_user_id: userId
      });

      if (error) {
        console.error('RPC error:', error);
        setComparisons([]);
        return;
      }
      
      // Format the data to match our HealthScoreComparison type
      const formattedComparisons: HealthScoreComparison[] = (data || []).map((comparison: any) => ({
        id: comparison.id,
        user_id: comparison.user_id,
        comparison_name: comparison.comparison_name,
        deal_ids: Array.isArray(comparison.deal_ids) ? comparison.deal_ids : [],
        date_range_start: comparison.date_range_start,
        date_range_end: comparison.date_range_end,
        created_at: comparison.created_at
      }));
      
      setComparisons(formattedComparisons);
    } catch (error) {
      console.error('Error fetching comparisons:', error);
      toast.error('Failed to load comparisons');
      setComparisons([]);
    }
  };

  // Fetch reports using RPC function
  const fetchReports = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase.rpc('get_health_reports', {
        p_user_id: userId
      });

      if (error) {
        console.error('RPC error:', error);
        setReports([]);
        return;
      }
      
      // Format the data to match our HealthReport type
      const formattedReports: HealthReport[] = (data || []).map((report: any) => ({
        id: report.id,
        user_id: report.user_id,
        report_name: report.report_name,
        report_type: report.report_type as 'pdf' | 'csv' | 'json',
        deal_ids: Array.isArray(report.deal_ids) ? report.deal_ids : undefined,
        date_range_start: report.date_range_start,
        date_range_end: report.date_range_end,
        report_data: report.report_data,
        file_url: report.file_url,
        status: report.status as 'generating' | 'completed' | 'failed',
        created_at: report.created_at
      }));
      
      setReports(formattedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
      setReports([]);
    }
  };

  // Create custom metric using RPC function
  const createCustomMetric = async (metric: Omit<CustomHealthMetric, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase.rpc('create_custom_metric', {
        p_deal_id: metric.deal_id,
        p_user_id: metric.user_id,
        p_metric_name: metric.metric_name,
        p_metric_weight: metric.metric_weight,
        p_current_value: metric.current_value,
        p_target_value: metric.target_value,
        p_is_active: metric.is_active
      });

      if (error) throw error;
      
      // Format the returned data
      const formattedMetric: CustomHealthMetric = {
        id: data.id,
        deal_id: data.deal_id,
        user_id: data.user_id,
        metric_name: data.metric_name,
        metric_weight: data.metric_weight,
        current_value: data.current_value,
        target_value: data.target_value,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setCustomMetrics(prev => [formattedMetric, ...prev]);
      toast.success('Custom metric created successfully');
      return formattedMetric;
    } catch (error) {
      console.error('Error creating custom metric:', error);
      toast.error('Failed to create custom metric');
      return null;
    }
  };

  // Create recovery plan (using mock data until table is ready)
  const createRecoveryPlan = async (plan: Omit<HealthRecoveryPlan, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const mockPlan: HealthRecoveryPlan = {
        id: crypto.randomUUID(),
        deal_id: plan.deal_id,
        user_id: plan.user_id,
        current_score: plan.current_score,
        target_score: plan.target_score,
        estimated_timeline_days: plan.estimated_timeline_days,
        action_items: plan.action_items,
        status: plan.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setRecoveryPlans(prev => [mockPlan, ...prev]);
      toast.success('Recovery plan created successfully');
      return mockPlan;
    } catch (error) {
      console.error('Error creating recovery plan:', error);
      toast.error('Failed to create recovery plan');
      return null;
    }
  };

  // Create comparison (using mock data until table is ready)
  const createComparison = async (comparison: Omit<HealthScoreComparison, 'id' | 'created_at'>) => {
    try {
      const mockComparison: HealthScoreComparison = {
        id: crypto.randomUUID(),
        user_id: comparison.user_id,
        comparison_name: comparison.comparison_name,
        deal_ids: comparison.deal_ids,
        date_range_start: comparison.date_range_start,
        date_range_end: comparison.date_range_end,
        created_at: new Date().toISOString()
      };
      
      setComparisons(prev => [mockComparison, ...prev]);
      toast.success('Comparison created successfully');
      return mockComparison;
    } catch (error) {
      console.error('Error creating comparison:', error);
      toast.error('Failed to create comparison');
      return null;
    }
  };

  // Generate report (using mock data until table is ready)
  const generateReport = async (reportConfig: Omit<HealthReport, 'id' | 'created_at' | 'status' | 'report_data' | 'file_url'>) => {
    try {
      const mockReport: HealthReport = {
        id: crypto.randomUUID(),
        user_id: reportConfig.user_id,
        report_name: reportConfig.report_name,
        report_type: reportConfig.report_type,
        deal_ids: reportConfig.deal_ids,
        date_range_start: reportConfig.date_range_start,
        date_range_end: reportConfig.date_range_end,
        status: 'generating',
        created_at: new Date().toISOString()
      };
      
      setReports(prev => [mockReport, ...prev]);
      toast.success('Report generation started');
      
      // Simulate report generation
      setTimeout(() => {
        setReports(prev => 
          prev.map(report => 
            report.id === mockReport.id 
              ? { 
                  ...report, 
                  status: 'completed' as const, 
                  report_data: { 
                    summary: 'Health report generated successfully',
                    deal_count: reportConfig.deal_ids?.length || 0,
                    generated_at: new Date().toISOString()
                  },
                  file_url: `/reports/${mockReport.id}.${reportConfig.report_type}` 
                } 
              : report
          )
        );
        toast.success('Report generated successfully');
      }, 3000);
      
      return mockReport;
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

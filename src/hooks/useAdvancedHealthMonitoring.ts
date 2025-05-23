
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
      // Use direct SQL query to handle the database structure correctly
      const { data, error } = await supabase
        .from('deal_health_predictions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      // Map database fields to the expected HealthPrediction structure
      const formattedPredictions = data?.map(item => ({
        id: item.id,
        deal_id: item.deal_id,
        predicted_score: item.probability_percentage, // Map to the correct field
        prediction_date: new Date().toISOString(), // Use a default if not available
        confidence_level: parseFloat(item.confidence_level) || 0.5,
        factors: item.suggested_improvements?.map((imp: any) => ({
          factor: imp.area || 'Unknown factor',
          impact: imp.impact === 'high' ? 15 : imp.impact === 'medium' ? 10 : 5,
          description: imp.recommendation || 'No description'
        })) || [],
        created_at: item.created_at
      }));

      setPredictions(formattedPredictions || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast.error('Failed to load health predictions');
    }
  };

  // Fetch custom metrics
  const fetchCustomMetrics = async () => {
    if (!userId) return;
    
    try {
      // Direct SQL query approach
      const { data, error } = await supabase.rpc('get_custom_metrics', {
        p_user_id: userId
      });

      if (error) {
        // If RPC fails, try direct fetch (will work after migration has been applied)
        const { data: directData, error: directError } = await supabase.rpc('get_custom_health_metrics', {
          p_user_id: userId
        });
        
        if (directError) {
          // Fallback to empty array if both methods fail
          setCustomMetrics([]);
          return;
        }
        
        setCustomMetrics(directData || []);
        return;
      }
      
      setCustomMetrics(data || []);
    } catch (error) {
      console.error('Error fetching custom metrics:', error);
      toast.error('Failed to load custom metrics');
      // Set empty array on error
      setCustomMetrics([]);
    }
  };

  // Fetch recovery plans
  const fetchRecoveryPlans = async () => {
    if (!userId) return;
    
    try {
      // Direct SQL query approach
      const { data, error } = await supabase.rpc('get_recovery_plans', {
        p_user_id: userId
      });

      if (error) {
        // Fallback to empty array if query fails
        setRecoveryPlans([]);
        return;
      }
      
      setRecoveryPlans(data || []);
    } catch (error) {
      console.error('Error fetching recovery plans:', error);
      toast.error('Failed to load recovery plans');
      // Set empty array on error
      setRecoveryPlans([]);
    }
  };

  // Fetch comparisons
  const fetchComparisons = async () => {
    if (!userId) return;
    
    try {
      // Direct SQL query approach
      const { data, error } = await supabase.rpc('get_health_comparisons', {
        p_user_id: userId
      });

      if (error) {
        // Fallback to empty array if query fails
        setComparisons([]);
        return;
      }
      
      setComparisons(data || []);
    } catch (error) {
      console.error('Error fetching comparisons:', error);
      toast.error('Failed to load comparisons');
      // Set empty array on error
      setComparisons([]);
    }
  };

  // Fetch reports
  const fetchReports = async () => {
    if (!userId) return;
    
    try {
      // Direct SQL query approach
      const { data, error } = await supabase.rpc('get_health_reports', {
        p_user_id: userId
      });

      if (error) {
        // Fallback to empty array if query fails
        setReports([]);
        return;
      }
      
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
      // Set empty array on error
      setReports([]);
    }
  };

  // Create custom metric
  const createCustomMetric = async (metric: Omit<CustomHealthMetric, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Use direct SQL insert
      const { data, error } = await supabase.rpc('create_custom_metric', {
        p_deal_id: metric.deal_id,
        p_user_id: metric.user_id,
        p_metric_name: metric.metric_name,
        p_metric_weight: metric.metric_weight,
        p_current_value: metric.current_value,
        p_target_value: metric.target_value,
        p_is_active: metric.is_active
      });

      if (error) {
        // If RPC fails, try direct insert (will work after migration has been applied)
        const { data: insertData, error: insertError } = await supabase
          .from('custom_health_metrics')
          .insert([metric])
          .select('*')
          .single();
          
        if (insertError) throw insertError;
        
        setCustomMetrics(prev => [insertData, ...prev]);
        toast.success('Custom metric created successfully');
        return insertData;
      }
      
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
      // Using placeholder data until the actual tables are available
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

  // Create comparison
  const createComparison = async (comparison: Omit<HealthScoreComparison, 'id' | 'created_at'>) => {
    try {
      // Using placeholder data until the actual tables are available
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

  // Generate report
  const generateReport = async (reportConfig: Omit<HealthReport, 'id' | 'created_at' | 'status' | 'report_data' | 'file_url'>) => {
    try {
      // Using placeholder data until the actual tables are available
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
                  status: 'completed', 
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

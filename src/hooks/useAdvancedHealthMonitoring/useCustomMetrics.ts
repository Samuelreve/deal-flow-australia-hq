
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CustomHealthMetric } from '@/types/advancedHealthMonitoring';

export const useCustomMetrics = (userId?: string) => {
  const [customMetrics, setCustomMetrics] = useState<CustomHealthMetric[]>([]);

  const fetchCustomMetrics = async () => {
    if (!userId) return;
    
    try {
      // Use the updated function that properly checks deal access
      const { data, error } = await supabase.rpc('get_custom_health_metrics', {
        p_user_id: userId
      });

      if (error) throw error;
      
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

  const createCustomMetric = async (metric: Omit<CustomHealthMetric, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return null;
    
    try {
      // Use the database function for creating metrics
      const { data, error } = await supabase.rpc('create_custom_metric', {
        p_deal_id: metric.deal_id,
        p_user_id: userId,
        p_metric_name: metric.metric_name,
        p_metric_weight: metric.metric_weight,
        p_current_value: metric.current_value,
        p_target_value: metric.target_value,
        p_is_active: metric.is_active
      });

      if (error) throw error;
      
      const newMetric: CustomHealthMetric = {
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
      
      setCustomMetrics(prev => [newMetric, ...prev]);
      toast.success('Custom metric created successfully');
      return newMetric;
    } catch (error) {
      console.error('Error creating custom metric:', error);
      toast.error('Failed to create custom metric');
      return null;
    }
  };

  return {
    customMetrics,
    fetchCustomMetrics,
    createCustomMetric
  };
};

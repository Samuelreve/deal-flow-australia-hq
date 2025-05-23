
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CustomHealthMetric } from '@/types/advancedHealthMonitoring';

export const useCustomMetrics = (userId?: string) => {
  const [customMetrics, setCustomMetrics] = useState<CustomHealthMetric[]>([]);

  const fetchCustomMetrics = useCallback(async () => {
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
    }
  }, [userId]);

  const createCustomMetric = useCallback(async (
    metric: Omit<CustomHealthMetric, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CustomHealthMetric | null> => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('custom_health_metrics')
        .insert({
          ...metric,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      
      const newMetric = data as CustomHealthMetric;
      setCustomMetrics(prev => [newMetric, ...prev]);
      return newMetric;
    } catch (error) {
      console.error('Error creating custom metric:', error);
      return null;
    }
  }, [userId]);

  return {
    customMetrics,
    fetchCustomMetrics,
    createCustomMetric
  };
};

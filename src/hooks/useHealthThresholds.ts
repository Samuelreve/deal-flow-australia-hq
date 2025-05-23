
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HealthThreshold } from '@/types/healthMonitoring';
import { toast } from 'sonner';

export const useHealthThresholds = (dealId: string) => {
  const [thresholds, setThresholds] = useState<HealthThreshold[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThresholds = async () => {
    try {
      const { data, error } = await supabase
        .from('deal_health_thresholds')
        .select('*')
        .eq('deal_id', dealId)
        .order('threshold_value', { ascending: false });

      if (error) throw error;
      setThresholds(data || []);
    } catch (error) {
      console.error('Error fetching health thresholds:', error);
      toast.error('Failed to load health thresholds');
    } finally {
      setLoading(false);
    }
  };

  const updateThreshold = async (thresholdId: string, updates: Partial<HealthThreshold>) => {
    try {
      const { error } = await supabase
        .from('deal_health_thresholds')
        .update(updates)
        .eq('id', thresholdId);

      if (error) throw error;
      
      setThresholds(prev => 
        prev.map(t => t.id === thresholdId ? { ...t, ...updates } : t)
      );
      
      toast.success('Threshold updated successfully');
    } catch (error) {
      console.error('Error updating threshold:', error);
      toast.error('Failed to update threshold');
    }
  };

  const toggleThreshold = async (thresholdId: string, enabled: boolean) => {
    await updateThreshold(thresholdId, { is_enabled: enabled });
  };

  useEffect(() => {
    if (dealId) {
      fetchThresholds();
    }
  }, [dealId]);

  return {
    thresholds,
    loading,
    updateThreshold,
    toggleThreshold,
    refetch: fetchThresholds
  };
};


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HealthThreshold } from '@/types/healthMonitoring';
import { toast } from 'sonner';

export const useHealthThresholds = (dealId?: string) => {
  const [thresholds, setThresholds] = useState<HealthThreshold[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThresholds = async () => {
    try {
      // If no dealId provided, fetch all user's thresholds
      let query = supabase
        .from('deal_health_thresholds')
        .select('*')
        .order('threshold_value', { ascending: false });
      
      // Only filter by dealId if it's a valid UUID
      if (dealId && dealId !== 'global' && dealId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        query = query.eq('deal_id', dealId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Type assertion to ensure proper types
      const typedThresholds: HealthThreshold[] = (data || []).map(threshold => ({
        ...threshold,
        threshold_type: threshold.threshold_type as 'critical' | 'warning' | 'info'
      }));
      
      setThresholds(typedThresholds);
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
    fetchThresholds();
  }, [dealId]);

  return {
    thresholds,
    loading,
    updateThreshold,
    toggleThreshold,
    refetch: fetchThresholds
  };
};

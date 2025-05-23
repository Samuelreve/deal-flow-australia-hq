
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HealthScoreComparison } from '@/types/advancedHealthMonitoring';

export const useComparisons = (userId?: string) => {
  const [comparisons, setComparisons] = useState<HealthScoreComparison[]>([]);

  const fetchComparisons = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('health_score_comparisons')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to match our TypeScript interface
      const typedData = (data || []).map(item => ({
        ...item,
        deal_ids: Array.isArray(item.deal_ids) ? item.deal_ids as string[] : []
      })) as HealthScoreComparison[];
      
      setComparisons(typedData);
    } catch (error) {
      console.error('Error fetching comparisons:', error);
    }
  }, [userId]);

  const createComparison = useCallback(async (
    comparison: Omit<HealthScoreComparison, 'id' | 'created_at'>
  ): Promise<HealthScoreComparison | null> => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('health_score_comparisons')
        .insert({
          ...comparison,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      
      const typedData = {
        ...data,
        deal_ids: Array.isArray(data.deal_ids) ? data.deal_ids as string[] : []
      } as HealthScoreComparison;
      
      setComparisons(prev => [typedData, ...prev]);
      return typedData;
    } catch (error) {
      console.error('Error creating comparison:', error);
      return null;
    }
  }, [userId]);

  return {
    comparisons,
    fetchComparisons,
    createComparison
  };
};

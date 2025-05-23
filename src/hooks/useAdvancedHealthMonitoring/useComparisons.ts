
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HealthScoreComparison } from '@/types/advancedHealthMonitoring';

export const useComparisons = (userId?: string) => {
  const [comparisons, setComparisons] = useState<HealthScoreComparison[]>([]);

  const fetchComparisons = async () => {
    if (!userId) return;
    
    try {
      // Use the updated function that properly checks user access
      const { data, error } = await supabase.rpc('get_health_comparisons', {
        p_user_id: userId
      });

      if (error) throw error;
      
      const formattedComparisons: HealthScoreComparison[] = (data || []).map((comparison: any) => ({
        id: comparison.id,
        user_id: comparison.user_id,
        comparison_name: comparison.comparison_name,
        deal_ids: Array.isArray(comparison.deal_ids) 
          ? comparison.deal_ids as string[]
          : typeof comparison.deal_ids === 'string' 
            ? [comparison.deal_ids]
            : [],
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

  const createComparison = async (comparison: Omit<HealthScoreComparison, 'id' | 'created_at'>) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('health_score_comparisons')
        .insert({
          user_id: userId,
          comparison_name: comparison.comparison_name,
          deal_ids: comparison.deal_ids,
          date_range_start: comparison.date_range_start,
          date_range_end: comparison.date_range_end
        })
        .select()
        .single();

      if (error) throw error;
      
      const newComparison: HealthScoreComparison = {
        id: data.id,
        user_id: data.user_id,
        comparison_name: data.comparison_name,
        deal_ids: Array.isArray(data.deal_ids) 
          ? data.deal_ids as string[]
          : typeof data.deal_ids === 'string' 
            ? [data.deal_ids]
            : [],
        date_range_start: data.date_range_start,
        date_range_end: data.date_range_end,
        created_at: data.created_at
      };
      
      setComparisons(prev => [newComparison, ...prev]);
      toast.success('Comparison created successfully');
      return newComparison;
    } catch (error) {
      console.error('Error creating comparison:', error);
      toast.error('Failed to create comparison');
      return null;
    }
  };

  return {
    comparisons,
    fetchComparisons,
    createComparison
  };
};

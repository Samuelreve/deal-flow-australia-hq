
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HealthScoreComparison } from '@/types/advancedHealthMonitoring';

export const useComparisons = (userId?: string) => {
  const [comparisons, setComparisons] = useState<HealthScoreComparison[]>([]);

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

  return {
    comparisons,
    fetchComparisons,
    createComparison
  };
};

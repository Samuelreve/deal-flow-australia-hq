
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HealthPrediction } from '@/types/advancedHealthMonitoring';

export const usePredictions = (userId?: string) => {
  const [predictions, setPredictions] = useState<HealthPrediction[]>([]);

  const fetchPredictions = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('deal_health_predictions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to match our TypeScript interface
      const typedData = (data || []).map(item => ({
        ...item,
        suggested_improvements: Array.isArray(item.suggested_improvements) 
          ? item.suggested_improvements as Array<{ area: string; recommendation: string; impact: 'low' | 'medium' | 'high'; }>
          : []
      })) as HealthPrediction[];
      
      setPredictions(typedData);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  }, [userId]);

  const createPrediction = useCallback(async (
    dealId: string,
    probabilityPercentage: number,
    confidenceLevel: string,
    reasoning: string,
    suggestedImprovements: Array<{ area: string; recommendation: string; impact: 'low' | 'medium' | 'high'; }>
  ): Promise<HealthPrediction | null> => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('deal_health_predictions')
        .insert({
          deal_id: dealId,
          user_id: userId,
          probability_percentage: probabilityPercentage,
          confidence_level: confidenceLevel,
          reasoning,
          suggested_improvements: suggestedImprovements
        })
        .select()
        .single();

      if (error) throw error;
      
      const typedData = {
        ...data,
        suggested_improvements: Array.isArray(data.suggested_improvements) 
          ? data.suggested_improvements as Array<{ area: string; recommendation: string; impact: 'low' | 'medium' | 'high'; }>
          : []
      } as HealthPrediction;
      
      setPredictions(prev => [typedData, ...prev]);
      return typedData;
    } catch (error) {
      console.error('Error creating prediction:', error);
      return null;
    }
  }, [userId]);

  return {
    predictions,
    fetchPredictions,
    createPrediction
  };
};

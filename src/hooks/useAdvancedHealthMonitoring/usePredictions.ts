
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HealthPrediction } from '@/types/advancedHealthMonitoring';

export const usePredictions = (userId?: string) => {
  const [predictions, setPredictions] = useState<HealthPrediction[]>([]);

  const fetchPredictions = async () => {
    if (!userId) return;
    
    try {
      // Direct query instead of RPC until types are updated
      const { data, error } = await supabase
        .from('deal_health_predictions')
        .select(`
          *,
          deals!inner(
            deal_participants!inner(user_id)
          )
        `)
        .eq('deals.deal_participants.user_id', userId);

      if (error) throw error;
      
      const formattedPredictions: HealthPrediction[] = (data || []).map(item => ({
        id: item.id,
        deal_id: item.deal_id,
        user_id: item.user_id,
        probability_percentage: item.probability_percentage,
        confidence_level: item.confidence_level,
        reasoning: item.reasoning || '',
        suggested_improvements: Array.isArray(item.suggested_improvements) 
          ? item.suggested_improvements as Array<{ area: string; recommendation: string; impact: 'low' | 'medium' | 'high'; }>
          : [],
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setPredictions(formattedPredictions);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast.error('Failed to load health predictions');
    }
  };

  const createPrediction = async (
    dealId: string, 
    probabilityPercentage: number, 
    confidenceLevel: string, 
    reasoning: string,
    suggestedImprovements: Array<{ area: string; recommendation: string; impact: 'low' | 'medium' | 'high'; }>
  ) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('deal_health_predictions')
        .insert({
          deal_id: dealId,
          user_id: userId,
          probability_percentage: probabilityPercentage,
          confidence_level: confidenceLevel,
          reasoning: reasoning,
          suggested_improvements: suggestedImprovements
        })
        .select()
        .single();

      if (error) throw error;
      
      const newPrediction: HealthPrediction = {
        id: data.id,
        deal_id: data.deal_id,
        user_id: data.user_id,
        probability_percentage: data.probability_percentage,
        confidence_level: data.confidence_level,
        reasoning: data.reasoning || '',
        suggested_improvements: Array.isArray(data.suggested_improvements) 
          ? data.suggested_improvements as Array<{ area: string; recommendation: string; impact: 'low' | 'medium' | 'high'; }>
          : [],
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setPredictions(prev => [newPrediction, ...prev]);
      toast.success('Health prediction created');
      return newPrediction;
    } catch (error) {
      console.error('Error creating prediction:', error);
      toast.error('Failed to create prediction');
      return null;
    }
  };

  return {
    predictions,
    fetchPredictions,
    createPrediction
  };
};

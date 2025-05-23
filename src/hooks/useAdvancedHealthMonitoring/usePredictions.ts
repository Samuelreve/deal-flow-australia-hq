
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HealthPrediction } from '@/types/advancedHealthMonitoring';

export const usePredictions = (userId?: string) => {
  const [predictions, setPredictions] = useState<HealthPrediction[]>([]);

  const fetchPredictions = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('deal_health_predictions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      const formattedPredictions: HealthPrediction[] = (data || []).map(item => ({
        id: item.id,
        deal_id: item.deal_id,
        predicted_score: item.probability_percentage,
        prediction_date: item.created_at,
        confidence_level: parseFloat(item.confidence_level) || 0.5,
        factors: Array.isArray(item.suggested_improvements) 
          ? (item.suggested_improvements as any[]).map((imp: any) => ({
              factor: imp.area || 'Unknown factor',
              impact: imp.impact === 'high' ? 15 : imp.impact === 'medium' ? 10 : 5,
              description: imp.recommendation || 'No description'
            }))
          : [],
        created_at: item.created_at
      }));

      setPredictions(formattedPredictions);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast.error('Failed to load health predictions');
    }
  };

  return {
    predictions,
    fetchPredictions
  };
};

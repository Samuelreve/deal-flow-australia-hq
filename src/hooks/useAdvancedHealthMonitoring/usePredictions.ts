
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
        .from('deal_health_predictions_new')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedPredictions: HealthPrediction[] = (data || []).map(item => ({
        id: item.id,
        deal_id: item.deal_id,
        predicted_score: item.predicted_score,
        prediction_date: item.prediction_date,
        confidence_level: item.confidence_level,
        factors: Array.isArray(item.factors) 
          ? item.factors as Array<{ factor: string; impact: number; description: string; }>
          : [],
        created_at: item.created_at
      }));

      setPredictions(formattedPredictions);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast.error('Failed to load health predictions');
    }
  };

  // Function to create a new prediction
  const createPrediction = async (dealId: string, predictedScore: number, confidenceLevel: number, factors: Array<{ factor: string; impact: number; description: string; }>) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('deal_health_predictions_new')
        .insert({
          deal_id: dealId,
          user_id: userId,
          predicted_score: predictedScore,
          confidence_level: confidenceLevel,
          factors: factors,
          prediction_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      const newPrediction: HealthPrediction = {
        id: data.id,
        deal_id: data.deal_id,
        predicted_score: data.predicted_score,
        prediction_date: data.prediction_date,
        confidence_level: data.confidence_level,
        factors: Array.isArray(data.factors) 
          ? data.factors as Array<{ factor: string; impact: number; description: string; }>
          : [],
        created_at: data.created_at
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


import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HealthRecoveryPlan } from '@/types/advancedHealthMonitoring';

export const useRecoveryPlans = (userId?: string) => {
  const [recoveryPlans, setRecoveryPlans] = useState<HealthRecoveryPlan[]>([]);

  const fetchRecoveryPlans = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('health_recovery_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecoveryPlans(data || []);
    } catch (error) {
      console.error('Error fetching recovery plans:', error);
    }
  }, [userId]);

  const createRecoveryPlan = useCallback(async (
    plan: Omit<HealthRecoveryPlan, 'id' | 'created_at' | 'updated_at'>
  ): Promise<HealthRecoveryPlan | null> => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('health_recovery_plans')
        .insert({
          ...plan,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      
      const newPlan = data as HealthRecoveryPlan;
      setRecoveryPlans(prev => [newPlan, ...prev]);
      return newPlan;
    } catch (error) {
      console.error('Error creating recovery plan:', error);
      return null;
    }
  }, [userId]);

  return {
    recoveryPlans,
    fetchRecoveryPlans,
    createRecoveryPlan
  };
};

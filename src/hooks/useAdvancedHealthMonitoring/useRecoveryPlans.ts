
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
      
      // Cast the data to match our TypeScript interface
      const typedData = (data || []).map(item => ({
        ...item,
        action_items: Array.isArray(item.action_items) 
          ? item.action_items as Array<{
              id: string;
              title: string;
              description: string;
              priority: 'low' | 'medium' | 'high';
              estimated_impact: number;
              due_date?: string;
              completed: boolean;
            }>
          : [],
        status: item.status as 'active' | 'completed' | 'cancelled'
      })) as HealthRecoveryPlan[];
      
      setRecoveryPlans(typedData);
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
      
      const typedData = {
        ...data,
        action_items: Array.isArray(data.action_items) 
          ? data.action_items as Array<{
              id: string;
              title: string;
              description: string;
              priority: 'low' | 'medium' | 'high';
              estimated_impact: number;
              due_date?: string;
              completed: boolean;
            }>
          : [],
        status: data.status as 'active' | 'completed' | 'cancelled'
      } as HealthRecoveryPlan;
      
      setRecoveryPlans(prev => [typedData, ...prev]);
      return typedData;
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

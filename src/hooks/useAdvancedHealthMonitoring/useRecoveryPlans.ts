
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HealthRecoveryPlan } from '@/types/advancedHealthMonitoring';

export const useRecoveryPlans = (userId?: string) => {
  const [recoveryPlans, setRecoveryPlans] = useState<HealthRecoveryPlan[]>([]);

  const fetchRecoveryPlans = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('health_recovery_plans_new')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedPlans: HealthRecoveryPlan[] = (data || []).map((plan: any) => ({
        id: plan.id,
        deal_id: plan.deal_id,
        user_id: plan.user_id,
        current_score: plan.current_score,
        target_score: plan.target_score,
        estimated_timeline_days: plan.estimated_timeline_days,
        action_items: plan.action_items,
        status: plan.status as 'active' | 'completed' | 'cancelled',
        created_at: plan.created_at,
        updated_at: plan.updated_at
      }));
      
      setRecoveryPlans(formattedPlans);
    } catch (error) {
      console.error('Error fetching recovery plans:', error);
      toast.error('Failed to load recovery plans');
      setRecoveryPlans([]);
    }
  };

  const createRecoveryPlan = async (plan: Omit<HealthRecoveryPlan, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('health_recovery_plans_new')
        .insert({
          deal_id: plan.deal_id,
          user_id: userId,
          current_score: plan.current_score,
          target_score: plan.target_score,
          estimated_timeline_days: plan.estimated_timeline_days,
          action_items: plan.action_items,
          status: plan.status
        })
        .select()
        .single();

      if (error) throw error;
      
      const newPlan: HealthRecoveryPlan = {
        id: data.id,
        deal_id: data.deal_id,
        user_id: data.user_id,
        current_score: data.current_score,
        target_score: data.target_score,
        estimated_timeline_days: data.estimated_timeline_days,
        action_items: data.action_items,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setRecoveryPlans(prev => [newPlan, ...prev]);
      toast.success('Recovery plan created successfully');
      return newPlan;
    } catch (error) {
      console.error('Error creating recovery plan:', error);
      toast.error('Failed to create recovery plan');
      return null;
    }
  };

  return {
    recoveryPlans,
    fetchRecoveryPlans,
    createRecoveryPlan
  };
};

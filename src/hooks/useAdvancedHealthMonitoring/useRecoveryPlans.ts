
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HealthRecoveryPlan } from '@/types/advancedHealthMonitoring';

export const useRecoveryPlans = (userId?: string) => {
  const [recoveryPlans, setRecoveryPlans] = useState<HealthRecoveryPlan[]>([]);

  const fetchRecoveryPlans = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase.rpc('get_recovery_plans', {
        p_user_id: userId
      });

      if (error) {
        console.error('RPC error:', error);
        setRecoveryPlans([]);
        return;
      }
      
      const formattedPlans: HealthRecoveryPlan[] = (data || []).map((plan: any) => ({
        id: plan.id,
        deal_id: plan.deal_id,
        user_id: plan.user_id,
        current_score: plan.current_score,
        target_score: plan.target_score,
        estimated_timeline_days: plan.estimated_timeline_days,
        action_items: Array.isArray(plan.action_items) ? plan.action_items : [],
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
    try {
      const mockPlan: HealthRecoveryPlan = {
        id: crypto.randomUUID(),
        deal_id: plan.deal_id,
        user_id: plan.user_id,
        current_score: plan.current_score,
        target_score: plan.target_score,
        estimated_timeline_days: plan.estimated_timeline_days,
        action_items: plan.action_items,
        status: plan.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setRecoveryPlans(prev => [mockPlan, ...prev]);
      toast.success('Recovery plan created successfully');
      return mockPlan;
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

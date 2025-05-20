
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Milestone, MilestoneStatus } from '@/types/deal';

export function useMilestoneTracker(dealId: string, initialMilestones: Milestone[] = []) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [loadingMilestones, setLoadingMilestones] = useState(initialMilestones.length === 0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [updatingMilestoneId, setUpdatingMilestoneId] = useState<string | null>(null);
  
  // Fetch milestones from API
  const fetchMilestones = useCallback(async () => {
    if (!dealId) return;
    
    try {
      setLoadingMilestones(true);
      setFetchError(null);
      
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('deal_id', dealId)
        .order('order_index', { ascending: true });
        
      if (error) throw error;
      
      const formattedMilestones = data.map((m: any): Milestone => ({
        id: m.id,
        title: m.title,
        description: m.description || '',
        status: m.status,
        dueDate: m.due_date ? new Date(m.due_date) : undefined,
        completedAt: m.completed_at ? new Date(m.completed_at) : undefined
      }));
      
      setMilestones(formattedMilestones);
    } catch (err: any) {
      console.error('Error fetching milestones:', err);
      setFetchError(err.message);
    } finally {
      setLoadingMilestones(false);
    }
  }, [dealId]);
  
  // Update milestone status
  const handleUpdateMilestoneStatus = async (milestoneId: string, newStatus: MilestoneStatus) => {
    setUpdatingMilestoneId(milestoneId);
    
    try {
      // Call the update-milestone-status edge function
      const { data, error } = await supabase.functions
        .invoke('update-milestone-status', {
          body: {
            milestoneId,
            newStatus
          }
        });
        
      if (error) throw error;
      
      // Update local state
      setMilestones(prevMilestones => 
        prevMilestones.map(m => 
          m.id === milestoneId 
            ? { ...m, status: newStatus }
            : m
        )
      );
      
      return true;
    } catch (err: any) {
      console.error('Error updating milestone status:', err);
      return false;
    } finally {
      setUpdatingMilestoneId(null);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    if (initialMilestones.length === 0) {
      fetchMilestones();
    }
  }, [fetchMilestones, initialMilestones.length]);
  
  return { 
    milestones, 
    loadingMilestones, 
    fetchError, 
    updatingMilestoneId,
    handleUpdateMilestoneStatus,
    fetchMilestones
  };
}

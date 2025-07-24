
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Milestone, MilestoneStatus } from '@/types/deal';
import { useMilestoneRealtime } from '@/hooks/milestones/useMilestoneRealtime';

export function useMilestoneTracker(dealId: string, initialMilestones: Milestone[] = []) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [loadingMilestones, setLoadingMilestones] = useState(initialMilestones.length === 0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [updatingMilestoneId, setUpdatingMilestoneId] = useState<string | null>(null);

  // Real-time milestone update handlers
  const handleRealtimeMilestoneUpdate = useCallback((updatedMilestone: Milestone) => {
    console.log('🔴 Real-time milestone update received:', updatedMilestone);
    setMilestones(prevMilestones => {
      return prevMilestones.map(m => 
        m.id === updatedMilestone.id ? updatedMilestone : m
      ).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    });
  }, []);

  const handleRealtimeMilestoneInsert = useCallback((newMilestone: Milestone) => {
    console.log('🔴 Real-time milestone insert received:', newMilestone);
    setMilestones(prevMilestones => {
      const exists = prevMilestones.some(m => m.id === newMilestone.id);
      if (exists) return prevMilestones;
      
      return [...prevMilestones, newMilestone]
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    });
  }, []);

  const handleRealtimeMilestoneDelete = useCallback((milestoneId: string) => {
    console.log('🔴 Real-time milestone delete received:', milestoneId);
    setMilestones(prevMilestones => 
      prevMilestones.filter(m => m.id !== milestoneId)
    );
  }, []);

  // Setup real-time subscription
  useMilestoneRealtime(
    dealId,
    handleRealtimeMilestoneUpdate,
    handleRealtimeMilestoneInsert,
    handleRealtimeMilestoneDelete
  );
  
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
      
      // Fetch assigned user profiles separately
      const milestonesWithUsers = await Promise.all(
        data.map(async (m: any) => {
          let assignedUser = undefined;
          
          if (m.assigned_to) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, name, email')
              .eq('id', m.assigned_to)
              .single();
            
            if (profileData) {
              assignedUser = {
                id: profileData.id,
                name: profileData.name,
                email: profileData.email
              };
            }
          }
          
          return {
            id: m.id,
            title: m.title,
            description: m.description || '',
            status: m.status,
            dueDate: m.due_date ? new Date(m.due_date) : undefined,
            completedAt: m.completed_at ? new Date(m.completed_at) : undefined,
            assigned_to: m.assigned_to,
            assignedUser,
            order_index: m.order_index
          };
        })
      );
      
      setMilestones(milestonesWithUsers);
    } catch (err: any) {
      console.error('Error fetching milestones:', err);
      setFetchError(err.message);
    } finally {
      setLoadingMilestones(false);
    }
  }, [dealId]);
  
  // Update milestone status
  const handleUpdateMilestoneStatus = async (milestoneId: string, newStatus: MilestoneStatus) => {
    console.log('🔄 Starting milestone status update:', { milestoneId, newStatus });
    setUpdatingMilestoneId(milestoneId);
    
    try {
      console.log('📡 Calling update-milestone-status edge function...');
      
      // Call the update-milestone-status edge function
      const { data, error } = await supabase.functions
        .invoke('update-milestone-status', {
          body: {
            milestoneId,
            newStatus
          }
        });
        
      console.log('📡 Edge function response:', { data, error });
        
      if (error) throw error;
      
      console.log('✅ Edge function succeeded, updating local state...');
      
      // Update local state
      setMilestones(prevMilestones => {
        const updated = prevMilestones.map(m => 
          m.id === milestoneId 
            ? { ...m, status: newStatus, completedAt: newStatus === 'completed' ? new Date() : m.completedAt }
            : m
        );
        console.log('📝 Updated milestones state:', updated);
        return updated;
      });
      
      console.log('✅ Milestone status update completed successfully');
      return true;
    } catch (err: any) {
      console.error('❌ Error updating milestone status:', err);
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

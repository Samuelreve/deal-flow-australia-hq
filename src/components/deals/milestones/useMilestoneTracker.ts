
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Milestone, MilestoneStatus } from '@/types/deal';
import { useMilestoneRealtime } from '@/hooks/milestones/useMilestoneRealtime';

export function useMilestoneTracker(dealId: string, initialMilestones: Milestone[] = []) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [loadingMilestones, setLoadingMilestones] = useState(initialMilestones.length === 0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [updatingMilestoneId, setUpdatingMilestoneId] = useState<string | null>(null);
  
  // Handle real-time milestone updates
  const handleRealtimeUpdate = useCallback(async (updatedMilestone: any) => {
    console.log('🔄 Real-time milestone update received:', updatedMilestone);
    
    // Fetch user profile if assigned_to exists
    let assignedUser = undefined;
    if (updatedMilestone.assigned_to) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('id', updatedMilestone.assigned_to)
        .single();
      
      if (profileData) {
        assignedUser = {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email
        };
      }
    }
    
    const formattedMilestone = {
      id: updatedMilestone.id,
      title: updatedMilestone.title,
      description: updatedMilestone.description || '',
      status: updatedMilestone.status,
      dueDate: updatedMilestone.due_date ? new Date(updatedMilestone.due_date) : undefined,
      completedAt: updatedMilestone.completed_at ? new Date(updatedMilestone.completed_at) : undefined,
      assigned_to: updatedMilestone.assigned_to,
      assignedUser,
      order_index: updatedMilestone.order_index
    };
    
    setMilestones(prevMilestones => {
      const updated = prevMilestones.map(m => 
        m.id === updatedMilestone.id ? { ...m, ...formattedMilestone } : m
      );
      console.log('✅ Updated milestones from real-time:', updated);
      console.log('🔄 Milestone status after update:', formattedMilestone.status);
      return updated;
    });
  }, []);

  const handleRealtimeInsert = useCallback(async (newMilestone: any) => {
    console.log('🆕 Real-time milestone insert received:', newMilestone);
    // Refetch all milestones to ensure proper order
    fetchMilestones();
  }, []);

  const handleRealtimeDelete = useCallback((deletedMilestone: any) => {
    console.log('🗑️ Real-time milestone delete received:', deletedMilestone);
    setMilestones(prevMilestones => 
      prevMilestones.filter(m => m.id !== deletedMilestone.id)
    );
  }, []);

  // Setup real-time subscription
  useMilestoneRealtime(
    dealId, 
    handleRealtimeUpdate, 
    handleRealtimeInsert, 
    handleRealtimeDelete
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

import { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Milestone } from '@/types/deal';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Custom hook for real-time milestone updates
 */
export function useMilestoneRealtime(
  dealId: string,
  onMilestoneUpdate?: (milestone: Milestone) => void,
  onMilestoneInsert?: (milestone: Milestone) => void,
  onMilestoneDelete?: (milestoneId: string) => void
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const transformMilestone = useCallback(async (milestoneData: any): Promise<Milestone> => {
    let assignedUser = undefined;
    
    if (milestoneData.assigned_to) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('id', milestoneData.assigned_to)
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
      id: milestoneData.id,
      title: milestoneData.title,
      description: milestoneData.description || '',
      status: milestoneData.status,
      dueDate: milestoneData.due_date ? new Date(milestoneData.due_date) : undefined,
      completedAt: milestoneData.completed_at ? new Date(milestoneData.completed_at) : undefined,
      assigned_to: milestoneData.assigned_to,
      assignedUser,
      order_index: milestoneData.order_index
    };
  }, []);

  useEffect(() => {
    if (!dealId) return;

    console.log('🔴 Setting up real-time milestone subscription for deal:', dealId);

    // Setup realtime subscription for milestones
    const milestonesChannel = supabase.channel(`milestones:${dealId}`);

    milestonesChannel
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'milestones', 
          filter: `deal_id=eq.${dealId}` 
        },
        async (payload) => {
          console.log('🔴 Realtime milestone INSERT received:', payload);
          const milestone = await transformMilestone(payload.new);
          onMilestoneInsert?.(milestone);
          toast.success('New milestone added');
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'milestones', 
          filter: `deal_id=eq.${dealId}` 
        },
        async (payload) => {
          console.log('🔴 Realtime milestone UPDATE received:', payload);
          const milestone = await transformMilestone(payload.new);
          onMilestoneUpdate?.(milestone);
          
          // Show appropriate toast based on status change
          const oldStatus = payload.old?.status;
          const newStatus = payload.new?.status;
          
          if (oldStatus !== newStatus) {
            if (newStatus === 'completed') {
              toast.success(`Milestone "${milestone.title}" completed`);
            } else if (newStatus === 'in_progress') {
              toast.info(`Milestone "${milestone.title}" started`);
            } else if (newStatus === 'blocked') {
              toast.warning(`Milestone "${milestone.title}" blocked`);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'milestones', 
          filter: `deal_id=eq.${dealId}` 
        },
        (payload) => {
          console.log('🔴 Realtime milestone DELETE received:', payload);
          onMilestoneDelete?.(payload.old?.id);
          toast.info('Milestone removed');
        }
      )
      .subscribe();

    setChannel(milestonesChannel);

    // Setup subscription for milestone assignments (when assigned_to changes)
    const assignmentsChannel = supabase.channel(`milestone_assignments:${dealId}`);
    
    assignmentsChannel
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'milestones', 
          filter: `deal_id=eq.${dealId}` 
        },
        async (payload) => {
          const oldAssignedTo = payload.old?.assigned_to;
          const newAssignedTo = payload.new?.assigned_to;
          
          if (oldAssignedTo !== newAssignedTo) {
            console.log('🔴 Milestone assignment changed:', { oldAssignedTo, newAssignedTo });
            const milestone = await transformMilestone(payload.new);
            onMilestoneUpdate?.(milestone);
            
            if (newAssignedTo) {
              toast.info(`Milestone "${milestone.title}" assigned`);
            } else {
              toast.info(`Milestone "${milestone.title}" unassigned`);
            }
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      console.log('🔴 Cleaning up milestone realtime subscriptions');
      if (milestonesChannel) {
        supabase.removeChannel(milestonesChannel);
      }
      if (assignmentsChannel) {
        supabase.removeChannel(assignmentsChannel);
      }
      setChannel(null);
    };
  }, [dealId, onMilestoneUpdate, onMilestoneInsert, onMilestoneDelete, transformMilestone]);

  return { channel };
}
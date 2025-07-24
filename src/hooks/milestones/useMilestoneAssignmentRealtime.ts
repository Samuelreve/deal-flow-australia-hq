import { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

interface MilestoneAssignmentData {
  id: string;
  milestone_id: string;
  user_id: string;
  assigned_by: string;
  assigned_at: string;
  role: string;
}

/**
 * Custom hook for real-time milestone assignment updates
 */
export function useMilestoneAssignmentRealtime(
  dealId?: string,
  milestoneId?: string,
  onAssignmentInsert?: (assignment: MilestoneAssignmentData) => void,
  onAssignmentUpdate?: (assignment: MilestoneAssignmentData) => void,
  onAssignmentDelete?: (assignmentId: string) => void
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!dealId && !milestoneId) return;

    console.log('🟡 Setting up real-time milestone assignment subscription for:', { dealId, milestoneId });

    const channelName = milestoneId 
      ? `milestone_assignments:milestone:${milestoneId}` 
      : `milestone_assignments:deal:${dealId}`;

    const assignmentsChannel = supabase.channel(channelName);

    if (milestoneId) {
      // Direct milestone subscription
      assignmentsChannel
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'milestone_assignments',
            filter: `milestone_id=eq.${milestoneId}`
          },
          async (payload) => {
            console.log('🟡 Realtime milestone assignment INSERT received:', payload);
            
            // Get assignee profile info
            const { data: profile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', payload.new.user_id)
              .single();

            // Get milestone info
            const { data: milestone } = await supabase
              .from('milestones')
              .select('title')
              .eq('id', payload.new.milestone_id)
              .single();

            onAssignmentInsert?.(payload.new as MilestoneAssignmentData);
            
            const assigneeName = profile?.name || 'Someone';
            const milestoneTitle = milestone?.title || 'milestone';
            toast.success(`${assigneeName} assigned to ${milestoneTitle}`);
          }
        )
        .on(
          'postgres_changes',
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'milestone_assignments',
            filter: `milestone_id=eq.${milestoneId}`
          },
          (payload) => {
            console.log('🟡 Realtime milestone assignment UPDATE received:', payload);
            onAssignmentUpdate?.(payload.new as MilestoneAssignmentData);
            toast.info('Milestone assignment updated');
          }
        )
        .on(
          'postgres_changes',
          { 
            event: 'DELETE', 
            schema: 'public', 
            table: 'milestone_assignments',
            filter: `milestone_id=eq.${milestoneId}`
          },
          (payload) => {
            console.log('🟡 Realtime milestone assignment DELETE received:', payload);
            onAssignmentDelete?.(payload.old?.id);
            toast.info('Milestone assignment removed');
          }
        );
    } else if (dealId) {
      // Deal-level subscription - more complex since we need to join with milestones
      // We'll subscribe to all milestone_assignments and filter in the handler
      assignmentsChannel
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'milestone_assignments'
          },
          async (payload) => {
            // Check if this assignment belongs to a milestone in our deal
            const milestoneId = (payload.new as any)?.milestone_id || (payload.old as any)?.milestone_id;
            if (!milestoneId) return;
            
            const { data: milestone } = await supabase
              .from('milestones')
              .select('deal_id, title')
              .eq('id', milestoneId)
              .single();

            if (milestone?.deal_id === dealId) {
              console.log('🟡 Realtime milestone assignment event for deal:', payload.eventType);
              
              if (payload.eventType === 'INSERT') {
                onAssignmentInsert?.(payload.new as MilestoneAssignmentData);
              } else if (payload.eventType === 'UPDATE') {
                onAssignmentUpdate?.(payload.new as MilestoneAssignmentData);
              } else if (payload.eventType === 'DELETE') {
                onAssignmentDelete?.(payload.old?.id);
              }
            }
          }
        );
    }

    assignmentsChannel.subscribe();
    setChannel(assignmentsChannel);

    // Cleanup function
    return () => {
      console.log('🟡 Cleaning up milestone assignment realtime subscription');
      if (assignmentsChannel) {
        supabase.removeChannel(assignmentsChannel);
      }
      setChannel(null);
    };
  }, [dealId, milestoneId, onAssignmentInsert, onAssignmentUpdate, onAssignmentDelete]);

  return { channel };
}
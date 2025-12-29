import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Milestone } from '@/types/deal';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Custom hook for setting up and managing real-time updates for milestones
 */
export function useMilestoneRealtime(
  dealId: string | undefined,
  onUpdate?: (updatedMilestone: any) => void,
  onInsert?: (newMilestone: any) => void,
  onDelete?: (deletedMilestone: any) => void
) {
  const [milestonesChannel, setMilestonesChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!dealId) {
      return;
    }

    // Setup realtime subscription for milestones
    const channel = supabase.channel(`milestones:${dealId}`);

    channel
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'milestones', 
          filter: `deal_id=eq.${dealId}` 
        },
        (payload) => {
          
          const updatedMilestone = payload.new;
          if (onUpdate) onUpdate(updatedMilestone);
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'milestones', 
          filter: `deal_id=eq.${dealId}` 
        },
        (payload) => {
          
          const newMilestone = payload.new;
          if (onInsert) onInsert(newMilestone);
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
          
          const deletedMilestone = payload.old;
          if (onDelete) onDelete(deletedMilestone);
        }
      )
      .subscribe();
    
    setMilestonesChannel(channel);
    
    // Cleanup function
    return () => {
      
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [dealId, onUpdate, onInsert, onDelete]);

  return { milestonesChannel };
}
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Custom hook for setting up and managing real-time updates for deal participants and invitations
 */
export function useParticipantsRealtime(
  dealId: string | undefined,
  onParticipantsUpdate?: () => void,
  onInvitationsUpdate?: () => void
) {
  const [participantsChannel, setParticipantsChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!dealId) {
      return;
    }

    console.log('🔄 Setting up participants real-time subscriptions for deal:', dealId);

    // Setup realtime subscription for participants and invitations
    const channel = supabase.channel(`participants-invitations:${dealId}`);

    channel
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'deal_participants', 
          filter: `deal_id=eq.${dealId}` 
        },
        (payload) => {
          console.log('🔄 Real-time participants update:', payload);
          if (onParticipantsUpdate) {
            onParticipantsUpdate();
          }
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'deal_invitations', 
          filter: `deal_id=eq.${dealId}` 
        },
        (payload) => {
          console.log('📧 Real-time invitations update:', payload);
          if (onInvitationsUpdate) {
            onInvitationsUpdate();
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Participants real-time subscription status:', status);
      });
    
    setParticipantsChannel(channel);
    
    // Cleanup function
    return () => {
      console.log('🔄 Cleaning up participants real-time subscriptions');
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [dealId, onParticipantsUpdate, onInvitationsUpdate]);

  return { participantsChannel };
}
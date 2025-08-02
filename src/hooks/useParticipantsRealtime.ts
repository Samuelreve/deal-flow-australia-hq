import { useEffect, useState, useRef } from 'react';
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
  
  // Use refs to store the latest callbacks without causing re-renders
  const onParticipantsUpdateRef = useRef(onParticipantsUpdate);
  const onInvitationsUpdateRef = useRef(onInvitationsUpdate);
  
  // Update refs when callbacks change
  onParticipantsUpdateRef.current = onParticipantsUpdate;
  onInvitationsUpdateRef.current = onInvitationsUpdate;

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
          if (onParticipantsUpdateRef.current) {
            onParticipantsUpdateRef.current();
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
          if (onInvitationsUpdateRef.current) {
            onInvitationsUpdateRef.current();
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
  }, [dealId]); // Remove callback dependencies to prevent infinite loops

  return { participantsChannel };
}
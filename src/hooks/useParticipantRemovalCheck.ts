import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UseParticipantRemovalCheckProps {
  dealId: string;
  enabled?: boolean;
}

export const useParticipantRemovalCheck = ({ dealId, enabled = true }: UseParticipantRemovalCheckProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled || !user || !dealId) return;

    // Set up real-time subscription to detect when current user is removed
    const channel = supabase
      .channel(`participant-removal-${dealId}-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'deal_participants',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🚨 Current user removed from deal:', payload);
          
          // Check if this deletion is for the current deal
          if (payload.old?.deal_id === dealId) {
            // Show alert and redirect
            toast({
              title: "Access Removed",
              description: "You have been removed from this deal and no longer have access.",
              variant: "destructive",
            });

            // Redirect to dashboard after a short delay
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 2000);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [dealId, user, enabled, navigate, toast]);

  // Function to check if user is still a participant (for route protection)
  const checkParticipantStatus = async (): Promise<boolean> => {
    if (!user || !dealId) return false;

    try {
      const { data, error } = await supabase
        .from('deal_participants')
        .select('id')
        .eq('deal_id', dealId)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking participant status:', error);
      return false;
    }
  };

  return { checkParticipantStatus };
};
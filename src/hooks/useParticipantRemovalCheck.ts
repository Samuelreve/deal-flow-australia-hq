import { useEffect, useRef, useCallback } from 'react';
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

  // Function to check if user is still a participant (for route protection)
  const checkParticipantStatus = useCallback(async (): Promise<boolean> => {
    if (!user || !dealId) return false;

    try {
      const { data, error } = await supabase
        .from('deal_participants')
        .select('id')
        .eq('deal_id', dealId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking participant status:', error);
        return false;
      }

      // Return true only if data exists
      return !!data;
    } catch (error) {
      console.error('Error checking participant status:', error);
      return false;
    }
  }, [user, dealId]);

  useEffect(() => {
    if (!enabled || !user || !dealId) return;

    // Initial access verification
    const verifyInitialAccess = async () => {
      const isValid = await checkParticipantStatus();
      if (!isValid) {
        toast({
          title: "Access Denied",
          description: "You don't have access to this deal or have been removed from it.",
          variant: "destructive",
        });
        navigate('/dashboard', { replace: true });
        return;
      }
    };

    verifyInitialAccess();

    // Set up periodic access verification (every 30 seconds)
    const verificationInterval = setInterval(async () => {
      const isValid = await checkParticipantStatus();
      if (!isValid) {
        toast({
          title: "Access Removed",
          description: "You have been removed from this deal and no longer have access.",
          variant: "destructive",
        });
        navigate('/dashboard', { replace: true });
        clearInterval(verificationInterval);
      }
    }, 30000);

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
            // Clear interval and show alert
            clearInterval(verificationInterval);
            toast({
              title: "Access Removed",
              description: "You have been removed from this deal and no longer have access.",
              variant: "destructive",
            });

            // Immediate redirect
            navigate('/dashboard', { replace: true });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      clearInterval(verificationInterval);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [dealId, user, enabled, navigate, toast, checkParticipantStatus]);

  return { checkParticipantStatus };
};
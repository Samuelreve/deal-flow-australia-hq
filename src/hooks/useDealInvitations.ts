
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DealInvitation, DealInvitationsResponse } from "@/types/invitation";
import { toast } from "@/hooks/use-toast";

export function useDealInvitations(dealId: string, canInviteParticipants: boolean) {
  const [invitations, setInvitations] = useState<DealInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch pending invitations for this deal
  const fetchInvitations = useCallback(async () => {
    if (!dealId || !canInviteParticipants) {
      setLoadingInvitations(false);
      return;
    }

    setLoadingInvitations(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase.rpc('get_deal_invitations', {
        p_deal_id: dealId
      });

      if (supabaseError) {
        console.error('Error fetching invitations:', supabaseError);
        setError(supabaseError.message);
        toast({
          title: "Error fetching invitations",
          description: supabaseError.message,
          variant: "destructive"
        });
        setInvitations([]);
        return;
      }

      // Cast the response to the expected type with proper type checking
      const response = data as unknown as DealInvitationsResponse;
      
      if (response && response.success && Array.isArray(response.invitations)) {
        setInvitations(response.invitations);
      } else {
        console.warn('Invalid invitations response format:', response);
        setInvitations([]);
        setError('Invalid response format from server');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching invitations';
      console.error('Error fetching invitations:', error);
      setError(errorMessage);
      toast({
        title: "Error fetching invitations",
        description: errorMessage,
        variant: "destructive"
      });
      setInvitations([]);
    } finally {
      setLoadingInvitations(false);
    }
  }, [dealId, canInviteParticipants]);

  return {
    invitations,
    loadingInvitations,
    error,
    fetchInvitations
  };
}

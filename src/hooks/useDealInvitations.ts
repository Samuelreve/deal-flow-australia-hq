
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DealInvitation, DealInvitationsResponse } from "@/types/invitation";

export function useDealInvitations(dealId: string, canInviteParticipants: boolean) {
  const [invitations, setInvitations] = useState<DealInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

  // Function to fetch pending invitations for this deal
  const fetchInvitations = useCallback(async () => {
    if (!dealId || !canInviteParticipants) {
      setLoadingInvitations(false);
      return;
    }

    setLoadingInvitations(true);

    try {
      const { data, error } = await supabase.rpc('get_deal_invitations', {
        p_deal_id: dealId
      });

      if (error) {
        console.error('Error fetching invitations:', error);
        return;
      }

      // Cast the response to the expected type and handle with proper type checking
      const response = data as unknown as DealInvitationsResponse;
      
      if (response && response.success && response.invitations) {
        setInvitations(Array.isArray(response.invitations) ? response.invitations : []);
      } else {
        setInvitations([]);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoadingInvitations(false);
    }
  }, [dealId, canInviteParticipants]);

  return {
    invitations,
    loadingInvitations,
    fetchInvitations
  };
}

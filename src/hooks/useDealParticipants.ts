
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Deal } from "@/types/deal";
import { DealParticipant } from "@/components/deals/DealParticipants";

export function useDealParticipants(
  deal: Deal, 
  onParticipantsLoaded?: (participants: DealParticipant[]) => void
) {
  const { isAuthenticated } = useAuth();
  const [participants, setParticipants] = useState<DealParticipant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Function to fetch participants from Supabase
  const fetchParticipants = useCallback(async () => {
    if (!deal.id || !isAuthenticated) {
      // Use mock data if not authenticated
      if (deal.participants && deal.participants.length > 0) {
        const mockParticipants = deal.participants.map(p => ({
          user_id: p.id,
          deal_id: deal.id,
          role: p.role,
          joined_at: p.joined.toISOString(),
          profile_name: `User ${p.id}`,
          profile_avatar_url: null
        }));
        
        setParticipants(mockParticipants);
        
        if (onParticipantsLoaded) {
          onParticipantsLoaded(mockParticipants);
        }
      }
      setLoadingParticipants(false);
      return;
    }

    setLoadingParticipants(true);
    setFetchError(null);

    try {
      // Fetch participants with joined profile data
      const { data, error } = await supabase
        .from('deal_participants')
        .select(`
          user_id,
          deal_id,
          role,
          joined_at,
          profiles:user_id (
            name,
            avatar_url
          )
        `)
        .eq('deal_id', deal.id);

      if (error) {
        console.error('Error fetching participants:', error);
        throw new Error(error.message || 'Failed to fetch participants');
      }

      // Map the data to our interface
      const fetchedParticipants: DealParticipant[] = data.map((item: any) => ({
        user_id: item.user_id,
        deal_id: item.deal_id,
        role: item.role,
        joined_at: item.joined_at,
        profile_name: item.profiles?.name || 'Unknown User',
        profile_avatar_url: item.profiles?.avatar_url || null
      }));

      setParticipants(fetchedParticipants);
      
      // Notify parent component about loaded participants
      if (onParticipantsLoaded) {
        onParticipantsLoaded(fetchedParticipants);
      }
    } catch (error: any) {
      console.error('Error fetching participants:', error);
      setFetchError(`Failed to load participants: ${error.message}`);
      
      // Fallback to mock data if available
      if (deal.participants && deal.participants.length > 0) {
        const mockParticipants = deal.participants.map(p => ({
          user_id: p.id,
          deal_id: deal.id,
          role: p.role,
          joined_at: p.joined.toISOString(),
          profile_name: `User ${p.id}`,
          profile_avatar_url: null
        }));
        
        setParticipants(mockParticipants);
        
        if (onParticipantsLoaded) {
          onParticipantsLoaded(mockParticipants);
        }
      }
    } finally {
      setLoadingParticipants(false);
    }
  }, [deal.id, isAuthenticated, deal.participants, onParticipantsLoaded]);

  return {
    participants,
    loadingParticipants,
    fetchError,
    fetchParticipants
  };
}

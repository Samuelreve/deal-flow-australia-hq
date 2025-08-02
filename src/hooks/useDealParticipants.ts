
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Deal } from "@/types/deal";
import { DealParticipant } from "@/components/deals/DealParticipants";
import { toast } from "@/hooks/use-toast";

type ParticipantsLoadedCallback = (participants: DealParticipant[]) => void;

export function useDealParticipants(
  deal: Deal, 
  onParticipantsLoaded?: ParticipantsLoadedCallback
) {
  const { isAuthenticated } = useAuth();
  const [participants, setParticipants] = useState<DealParticipant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Function to map mock participants from deal data
  const mapMockParticipants = useCallback((): DealParticipant[] => {
    if (!deal.participants || deal.participants.length === 0) {
      return [];
    }
    
    return deal.participants.map(p => ({
      user_id: p.id,
      deal_id: deal.id,
      role: p.role,
      joined_at: p.joined.toISOString(),
      profile_name: `User ${p.id}`,
      profile_avatar_url: null
    }));
  }, [deal.id, deal.participants]);

  // Function to fetch participants from Supabase
  const fetchParticipants = useCallback(async () => {
    if (!deal.id) {
      setLoadingParticipants(false);
      setFetchError(null);
      return;
    }

    // Use mock data if not authenticated
    if (!isAuthenticated) {
      const mockParticipants = mapMockParticipants();
      setParticipants(mockParticipants);
      
      if (onParticipantsLoaded) {
        onParticipantsLoaded(mockParticipants);
      }
      
      setLoadingParticipants(false);
      setFetchError(null);
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
            avatar_url,
            email
          )
        `)
        .eq('deal_id', deal.id);

      if (error) {
        throw new Error(error.message || 'Failed to fetch participants');
      }

      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }

      // Map the data to our interface
      const fetchedParticipants: DealParticipant[] = data.map((item: any) => ({
        user_id: item.user_id,
        deal_id: item.deal_id,
        role: item.role,
        joined_at: item.joined_at,
        profile_name: item.profiles?.name || 'Unknown User',
        profile_avatar_url: item.profiles?.avatar_url || null,
        profiles: item.profiles
      }));

      setParticipants(fetchedParticipants);
      
      // Notify parent component about loaded participants
      if (onParticipantsLoaded) {
        onParticipantsLoaded(fetchedParticipants);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching participants';
      setFetchError(errorMessage);
      
      toast({
        title: "Error fetching participants",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Fallback to mock data if available
      if (deal.participants && deal.participants.length > 0) {
        const mockParticipants = mapMockParticipants();
        setParticipants(mockParticipants);
        
        if (onParticipantsLoaded) {
          onParticipantsLoaded(mockParticipants);
        }
      }
    } finally {
      setLoadingParticipants(false);
    }
  }, [deal.id, isAuthenticated, deal.participants, mapMockParticipants, onParticipantsLoaded]);

  // Set up real-time updates for participants and invitations
  useEffect(() => {
    if (!isAuthenticated || !deal.id) return;

    console.log('🔄 Setting up real-time subscriptions for deal:', deal.id);

    // Create unique channel name with timestamp to prevent conflicts
    const channelName = `participants-${deal.id}-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deal_participants',
          filter: `deal_id=eq.${deal.id}`
        },
        (payload) => {
          console.log('🔄 Deal participants real-time update:', payload);
          // Use a small delay to ensure database consistency
          setTimeout(() => {
            fetchParticipants();
          }, 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deal_invitations',
          filter: `deal_id=eq.${deal.id}`
        },
        (payload) => {
          console.log('📧 Deal invitations real-time update:', payload);
          // Use a small delay to ensure database consistency
          setTimeout(() => {
            fetchParticipants();
          }, 100);
          
          // Show toast notification for invitation acceptance
          if (payload.new && (payload.new as any).status === 'accepted' && payload.old && (payload.old as any).status === 'pending') {
            toast({
              title: "🎉 Invitation Accepted!",
              description: `${(payload.new as any).invitee_email} has joined the deal`,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
      });

    return () => {
      console.log('🔄 Cleaning up real-time subscriptions');
      supabase.removeChannel(channel);
    };
  }, [deal.id, isAuthenticated]); // Removed fetchParticipants from deps to prevent recreation

  return {
    participants,
    loadingParticipants,
    fetchError,
    fetchParticipants
  };
}

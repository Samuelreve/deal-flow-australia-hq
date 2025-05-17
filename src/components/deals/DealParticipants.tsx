
import { useState, useEffect, useCallback } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Deal } from "@/types/deal";
import { UserRole } from "@/types/auth";

interface DealParticipantsProps {
  deal: Deal;
  onParticipantsLoaded?: (participants: DealParticipant[]) => void;
  currentUserDealRole?: 'seller' | 'buyer' | 'lawyer' | 'admin' | null;
  dealStatus?: string;
}

// Define interface for deal participant
export interface DealParticipant {
  user_id: string;
  deal_id: string;
  role: UserRole;
  joined_at: string;
  profile_name: string | null;
  profile_avatar_url: string | null;
}

const DealParticipants = ({ deal, onParticipantsLoaded, currentUserDealRole, dealStatus }: DealParticipantsProps) => {
  const { user, session, isAuthenticated } = useAuth();
  const [participants, setParticipants] = useState<DealParticipant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // --- Frontend RBAC Helper ---
  // Determine if the current user's role in THIS deal allows them to invite participants
  // Based on typical workflow, allow Sellers and Admins to invite participants in draft deals
  const canInviteParticipants = 
    deal.status === "draft" && 
    currentUserDealRole && 
    (currentUserDealRole === 'seller' || currentUserDealRole === 'admin');
  // --- End Frontend RBAC Helper ---

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

  // Effect to fetch participants when component mounts or dependencies change
  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  return (
    <div className="space-y-4">
      {/* Loading and Error Indicators */}
      {loadingParticipants ? (
        <p className="text-xs text-muted-foreground text-center">Loading participants...</p>
      ) : fetchError ? (
        <p className="text-xs text-red-500 text-center">{fetchError}</p>
      ) : participants.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center">No participants found</p>
      ) : (
        /* Participants List */
        participants.map(participant => (
          <div key={participant.user_id} className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={participant.profile_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.profile_name || 'User')}&background=0D8ABC&color=fff`} 
                alt={participant.profile_name || 'User'} 
              />
              <AvatarFallback>{(participant.profile_name?.[0] || 'U').toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                {participant.profile_name || 'Unknown User'}
                {user?.id === participant.user_id && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">You</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground flex items-center justify-between">
                <span>
                  {participant.role === "seller" ? "Seller" : 
                  participant.role === "buyer" ? "Buyer" : 
                  participant.role === "lawyer" ? "Lawyer" : "Admin"}
                </span>
                <span className="ml-2">
                  Joined {new Intl.DateTimeFormat("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  }).format(new Date(participant.joined_at))}
                </span>
              </p>
            </div>
          </div>
        ))
      )}

      {/* --- Frontend RBAC Conditional Rendering for Invite Button --- */}
      {/* Only show the invite button if the user has permission */}
      {canInviteParticipants && (
        <Button variant="outline" className="w-full text-sm">
          <Users className="h-4 w-4 mr-2" />
          Invite Participant
        </Button>
      )}
      {/* --- End Frontend RBAC Conditional Rendering --- */}
    </div>
  );
};

export default DealParticipants;

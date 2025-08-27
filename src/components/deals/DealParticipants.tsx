
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Deal } from "@/types/deal";
import { UserRole } from "@/types/auth";
import ParticipantInvitationForm from "./ParticipantInvitationForm";
import { toast } from "@/hooks/use-toast";
import ParticipantsList from "./participants/ParticipantsList";
import PendingInvitations from "./participants/PendingInvitations";
import InviteParticipantButton from "./participants/InviteParticipantButton";
import { useDealParticipants } from "@/hooks/useDealParticipants";
import { useDealInvitations } from "@/hooks/useDealInvitations";

interface DealParticipantsProps {
  deal: Deal;
  onParticipantsLoaded?: (participants: DealParticipant[]) => void;
  currentUserDealRole?: 'seller' | 'buyer' | 'lawyer' | 'admin' | null;
  dealStatus?: string;
  onTabChange?: (tab: string) => void;
}

// Define interface for deal participant
export interface DealParticipant {
  user_id: string;
  deal_id: string;
  role: UserRole;
  joined_at: string;
  profile_name: string | null;
  profile_avatar_url: string | null;
  profiles?: {
    name?: string;
    avatar_url?: string;
    email?: string;
  };
}

const DealParticipants = ({ deal, onParticipantsLoaded, currentUserDealRole, dealStatus, onTabChange }: DealParticipantsProps) => {
  const { user } = useAuth();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Determine if the current user's role allows them to invite participants
  const canInviteParticipants = 
    deal.status === "draft" && 
    currentUserDealRole && 
    (currentUserDealRole === 'seller' || currentUserDealRole === 'admin');

  // Use custom hooks to fetch data
  const { 
    participants, 
    loadingParticipants, 
    fetchError, 
    fetchParticipants 
  } = useDealParticipants(deal, onParticipantsLoaded);

  const { 
    invitations, 
    loadingInvitations, 
    fetchInvitations 
  } = useDealInvitations(deal.id, canInviteParticipants);

  // Effect to fetch participants when component mounts or dependencies change
  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // Effect to fetch invitations when component mounts or dependencies change
  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // Handle invitation dialog
  const handleOpenInviteDialog = () => setIsInviteDialogOpen(true);
  const handleCloseInviteDialog = () => setIsInviteDialogOpen(false);
  
  const handleInvitationSent = () => {
    // Refresh participants and invitations after invitation is sent
    fetchInvitations();
    toast({
      title: "Invitation Sent",
      description: "The participant will receive an email with instructions."
    });
  };

  // Handle participant removed
  const handleParticipantRemoved = (userId?: string) => {
    // Refresh participants list after participant is removed
    fetchParticipants();
  };

  // Handle message click - navigate to messages tab
  const handleMessageClick = (participantId: string) => {
    if (onTabChange) {
      onTabChange('messages');
    }
  };

  return (
    <div className="space-y-4">
      {/* Participants List */}
      <ParticipantsList
        participants={participants}
        currentUserId={user?.id}
        isLoading={loadingParticipants}
        error={fetchError}
        dealId={deal.id}
        currentUserRole={currentUserDealRole}
        dealSellerId={deal.sellerId}
        onParticipantRemoved={handleParticipantRemoved}
        onMessageClick={handleMessageClick}
      />

      {/* Pending Invitations Section */}
      <PendingInvitations
        invitations={invitations}
        isLoading={loadingInvitations}
      />

      {/* Invite Participant Button */}
      <InviteParticipantButton
        onClick={handleOpenInviteDialog}
        canInviteParticipants={canInviteParticipants}
      />

      {/* Participant Invitation Dialog */}
      {isInviteDialogOpen && (
        <ParticipantInvitationForm
          dealId={deal.id}
          isOpen={isInviteDialogOpen}
          onClose={handleCloseInviteDialog}
          onInvitationSent={handleInvitationSent}
        />
      )}
    </div>
  );
};

export default DealParticipants;

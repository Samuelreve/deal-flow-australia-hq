import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Mail, Phone, Calendar, MessageCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ParticipantInvitationForm from "@/components/deals/ParticipantInvitationForm";
import ParticipantProfileModal from "@/components/deals/participants/ParticipantProfileModal";
import RemoveParticipantButton from "@/components/deals/participants/RemoveParticipantButton";
import { formatParticipantDate } from "@/utils/dateUtils";
import { useParticipantsRealtime } from "@/hooks/useParticipantsRealtime";

interface Participant {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles?: {
    name: string;
    avatar_url?: string;
    email?: string;
  };
}

interface PendingInvitation {
  id: string;
  invitee_email: string;
  invitee_role: string;
  created_at: string;
  status: string;
  invited_by_user_id: string;
}

interface DealParticipantsTabProps {
  dealId: string;
  onTabChange?: (tab: string, participantId?: string) => void;
}

const DealParticipantsTab: React.FC<DealParticipantsTabProps> = ({ dealId, onTabChange }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchParticipants = useCallback(async () => {
    try {
      // Fetch accepted participants using secure public profile function
      const { data: participantsData, error: participantsError } = await supabase
        .from('deal_participants')
        .select('*')
        .eq('deal_id', dealId)
        .order('joined_at', { ascending: false });

      if (participantsError) {
        toast({
          title: "Error",
          description: "Failed to load participants",
          variant: "destructive"
        });
        return;
      }

      // Get public profiles for all participants securely
      const { data: publicProfiles, error: profilesError } = await supabase
        .rpc('get_public_profiles_for_deal', { p_deal_id: dealId });

      if (profilesError) {
        console.warn('Could not fetch public profiles:', profilesError);
      }

      // Map participants with their public profile data
      const participantsWithProfiles = participantsData?.map(participant => {
        const publicProfile = publicProfiles?.find(p => p.id === participant.user_id);
        return {
          ...participant,
          profiles: publicProfile ? {
            name: publicProfile.name,
            avatar_url: publicProfile.avatar_url,
            role: publicProfile.role,
            professional_headline: publicProfile.professional_headline,
            professional_firm_name: publicProfile.professional_firm_name,
            professional_location: publicProfile.professional_location,
            professional_website: publicProfile.professional_website
          } : null
        };
      }) || [];

      // Fetch pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('deal_invitations')
        .select('*')
        .eq('deal_id', dealId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (invitationsError) {
        toast({
          title: "Error",
          description: "Failed to load pending invitations",
          variant: "destructive"
        });
        return;
      }

      setParticipants(participantsWithProfiles);
      setPendingInvitations(invitationsData || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast({
        title: "Error",
        description: "Failed to load participants data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [dealId, toast]);

  // Handle real-time updates with useCallback to prevent infinite re-renders
  const handleParticipantsUpdate = useCallback(() => {
    console.log('🔄 Participants updated in DealParticipantsTab, refreshing...');
    fetchParticipants();
  }, [fetchParticipants]);

  const handleInvitationsUpdate = useCallback(() => {
    console.log('📧 Invitations updated in DealParticipantsTab, refreshing...');
    fetchParticipants();
  }, [fetchParticipants]);

  // Set up real-time updates
  useParticipantsRealtime(
    dealId,
    handleParticipantsUpdate,
    handleInvitationsUpdate
  );

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'seller': 'bg-blue-100 text-blue-800 border-blue-200',
      'buyer': 'bg-green-100 text-green-800 border-green-200',
      'lawyer': 'bg-purple-100 text-purple-800 border-purple-200',
      'accountant': 'bg-orange-100 text-orange-800 border-orange-200',
      'broker': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'admin': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    return colors[role.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRoleIcon = (role: string) => {
    // You could add specific icons for each role here
    return null;
  };

  // Import formatParticipantDate from utils instead of defining locally

  const handleOpenInviteDialog = () => setIsInviteDialogOpen(true);
  const handleCloseInviteDialog = () => setIsInviteDialogOpen(false);
  
  const handleInvitationSent = () => {
    // Refresh participants list after successful invitation
    fetchParticipants();
    // The toast is already shown by the useInviteParticipant hook
  };

  const handleMessageClick = (participant: Participant) => {
    if (onTabChange) {
      onTabChange('messages', participant.user_id);
    }
  };

  const handleViewProfile = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedParticipant(null);
  };

  // Handle participant removal
  const handleParticipantRemoved = () => {
    fetchParticipants(); // Refresh the participants list
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Find current user's role and filter out current user from participants
  const currentUserParticipant = participants.find(participant => participant.user_id === user?.id);
  const currentUserRole = currentUserParticipant?.role;
  const otherParticipants = participants.filter(participant => participant.user_id !== user?.id);
  const totalParticipants = participants.length;

  // Check if current user can invite participants (only admin and seller)
  const canInviteParticipants = currentUserRole && ['admin', 'seller'].includes(currentUserRole);
  
  // Get deal seller ID for remove participant functionality
  const [dealSellerId, setDealSellerId] = useState<string | null>(null);
  
  // Fetch deal seller ID
  useEffect(() => {
    const fetchDealInfo = async () => {
      const { data: dealData } = await supabase
        .from('deals')
        .select('seller_id')
        .eq('id', dealId)
        .single();
      
      if (dealData) {
        setDealSellerId(dealData.seller_id);
      }
    };
    
    fetchDealInfo();
  }, [dealId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Deal Participants</h3>
          <p className="text-sm text-muted-foreground">
            {totalParticipants} participant{totalParticipants !== 1 ? 's' : ''} including you
            {pendingInvitations.length > 0 && ` • ${pendingInvitations.length} pending invitation${pendingInvitations.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {canInviteParticipants && (
          <Button className="flex items-center gap-2" onClick={handleOpenInviteDialog}>
            <UserPlus className="h-4 w-4" />
            Invite Participant
          </Button>
        )}
      </div>

      {/* Participants List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {otherParticipants.length === 0 && pendingInvitations.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-2">No other participants found</p>
                <p className="text-sm text-muted-foreground">Invite participants to collaborate on this deal</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Active Participants (excluding current user) */}
            {otherParticipants.map((participant) => (
              <Card key={participant.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={participant.profiles?.avatar_url} 
                        alt={participant.profiles?.name || 'User'} 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {(participant.profiles?.name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-base truncate">
                          {participant.profiles?.name || 'Unknown User'}
                        </h4>
                        {/* Only show "Accepted" badge for users who were actually invited (not original deal creators) */}
                        {participant.role !== 'admin' && participant.role !== 'seller' && (
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-xs">
                            Accepted
                          </Badge>
                        )}
                      </div>
                      
                      <Badge className={`mb-3 ${getRoleColor(participant.role)}`}>
                        {participant.role.charAt(0).toUpperCase() + participant.role.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                   {/* Action buttons */}
                   <div className="mt-4 flex gap-2">
                     <Button 
                       variant="outline" 
                       size="sm" 
                       className="flex-1"
                       onClick={() => handleMessageClick(participant)}
                     >
                       <MessageCircle className="h-4 w-4 mr-2" />
                       Message
                     </Button>
                     <Button 
                       variant="outline" 
                       size="sm" 
                       className="flex-1"
                       onClick={() => handleViewProfile(participant)}
                     >
                       <User className="h-4 w-4 mr-2" />
                       View Profile
                     </Button>
                     <RemoveParticipantButton
                       participant={{
                         user_id: participant.user_id,
                         deal_id: dealId,
                         role: participant.role as any,
                         joined_at: participant.joined_at,
                         profile_name: participant.profiles?.name || null,
                         profile_avatar_url: participant.profiles?.avatar_url || null,
                         profiles: participant.profiles
                       }}
                       dealId={dealId}
                       currentUserRole={currentUserRole}
                       dealSellerId={dealSellerId}
                       onParticipantRemoved={handleParticipantRemoved}
                       size="sm"
                     />
                   </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Pending Invitations */}
            {pendingInvitations.map((invitation) => (
              <Card key={invitation.id} className="hover:shadow-md transition-shadow border-dashed border-2">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-orange-50 text-orange-600 font-medium">
                        <Mail className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-base truncate">
                          {invitation.invitee_email}
                        </h4>
                        <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-xs">
                          Pending
                        </Badge>
                      </div>
                      
                      <Badge className={`mb-3 ${getRoleColor(invitation.invitee_role)}`}>
                        {invitation.invitee_role.charAt(0).toUpperCase() + invitation.invitee_role.slice(1)}
                      </Badge>
                      
                      <p className="text-xs text-muted-foreground">
                        Invited {formatParticipantDate(invitation.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>


      {/* Participant Invitation Dialog */}
      {isInviteDialogOpen && (
        <ParticipantInvitationForm
          dealId={dealId}
          isOpen={isInviteDialogOpen}
          onClose={handleCloseInviteDialog}
          onInvitationSent={handleInvitationSent}
        />
      )}

      {/* Profile Modal */}
      {selectedParticipant && (
        <ParticipantProfileModal
          isOpen={isProfileModalOpen}
          onClose={handleCloseProfileModal}
          participant={{
            user_id: selectedParticipant.user_id,
            role: selectedParticipant.role,
            joined_at: selectedParticipant.joined_at,
            profile_name: selectedParticipant.profiles?.name || null,
            profile_avatar_url: selectedParticipant.profiles?.avatar_url || null,
            profiles: selectedParticipant.profiles
          }}
          onMessageClick={() => handleMessageClick(selectedParticipant)}
        />
      )}
    </div>
  );
};

export default DealParticipantsTab;
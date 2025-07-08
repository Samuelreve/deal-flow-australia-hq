import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Mail, Phone, Calendar, MessageCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ParticipantInvitationForm from "@/components/deals/ParticipantInvitationForm";
import ParticipantProfileModal from "@/components/deals/participants/ParticipantProfileModal";

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

  useEffect(() => {
    fetchParticipants();
  }, [dealId]);

  const fetchParticipants = async () => {
    try {
      // Fetch accepted participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('deal_participants')
        .select(`
          *,
          profiles!deal_participants_user_id_fkey(name, avatar_url, email)
        `)
        .eq('deal_id', dealId)
        .order('joined_at', { ascending: false });

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        toast({
          title: "Error",
          description: "Failed to load participants",
          variant: "destructive"
        });
        return;
      }

      // Fetch pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('deal_invitations')
        .select('*')
        .eq('deal_id', dealId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (invitationsError) {
        console.error('Error fetching pending invitations:', invitationsError);
        toast({
          title: "Error",
          description: "Failed to load pending invitations",
          variant: "destructive"
        });
        return;
      }

      setParticipants(participantsData || []);
      setPendingInvitations(invitationsData || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleOpenInviteDialog = () => setIsInviteDialogOpen(true);
  const handleCloseInviteDialog = () => setIsInviteDialogOpen(false);
  
  const handleInvitationSent = () => {
    fetchParticipants(); // Refresh participants list
    toast({
      title: "Invitation Sent",
      description: "The participant will receive an email with instructions."
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Deal Participants</h3>
          <p className="text-sm text-muted-foreground">
            {participants.length} participant{participants.length !== 1 ? 's' : ''} 
            {pendingInvitations.length > 0 && ` • ${pendingInvitations.length} pending invitation${pendingInvitations.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={handleOpenInviteDialog}>
          <UserPlus className="h-4 w-4" />
          Invite Participant
        </Button>
      </div>

      {/* Participants List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {participants.length === 0 && pendingInvitations.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-2">No participants found</p>
                <p className="text-sm text-muted-foreground">Invite participants to collaborate on this deal</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Active Participants */}
            {participants.map((participant) => (
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
                        Invited {formatDate(invitation.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Summary Stats */}
      {participants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Participant Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(
                participants.reduce((acc, p) => {
                  acc[p.role] = (acc[p.role] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([role, count]) => (
                <div key={role} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">{role}{count > 1 ? 's' : ''}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
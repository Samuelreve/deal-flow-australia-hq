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

interface DealParticipantsTabProps {
  dealId: string;
  onTabChange?: (tab: string) => void;
}

const DealParticipantsTab: React.FC<DealParticipantsTabProps> = ({ dealId, onTabChange }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
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
      const { data, error } = await supabase
        .from('deal_participants')
        .select(`
          *,
          profiles!deal_participants_user_id_fkey(name, avatar_url)
        `)
        .eq('deal_id', dealId)
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Error fetching participants:', error);
        toast({
          title: "Error",
          description: "Failed to load participants",
          variant: "destructive"
        });
        return;
      }

      setParticipants(data || []);
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
      onTabChange('messages');
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
            {participants.length} participant{participants.length !== 1 ? 's' : ''} in this deal
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={handleOpenInviteDialog}>
          <UserPlus className="h-4 w-4" />
          Invite Participant
        </Button>
      </div>

      {/* Participants List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {participants.length === 0 ? (
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
          participants.map((participant) => (
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
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-base truncate">
                        {participant.profiles?.name || 'Unknown User'}
                      </h4>
                    </div>
                    
                    <Badge className={`mb-3 ${getRoleColor(participant.role)}`}>
                      {participant.role.charAt(0).toUpperCase() + participant.role.slice(1)}
                    </Badge>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {formatDate(participant.joined_at)}</span>
                      </div>
                      
                      {participant.profiles?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{participant.profiles.email}</span>
                        </div>
                      )}
                    </div>
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
          ))
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
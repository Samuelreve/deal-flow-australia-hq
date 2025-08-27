
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, User } from "lucide-react";
import RemoveParticipantButton from './RemoveParticipantButton';
import ParticipantProfileModal from './ParticipantProfileModal';
import { DealParticipant } from '@/components/deals/DealParticipants';

// Helper function to get user initials from display name
export const getUserInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

interface ParticipantItemProps {
  participant: DealParticipant;
  isCurrentUser?: boolean;
  dealId: string;
  currentUserRole?: string;
  dealSellerId?: string;
  onParticipantRemoved?: (userId: string) => void;
  onMessageClick?: (participantId: string) => void;
}

const ParticipantItem: React.FC<ParticipantItemProps> = ({ 
  participant,
  isCurrentUser,
  dealId,
  currentUserRole,
  dealSellerId,
  onParticipantRemoved,
  onMessageClick
}) => {
  const { profile_name, profile_avatar_url, role } = participant;
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const displayName = profile_name || 'Unknown User';
  const initials = getUserInitials(displayName);

  const handleMessageClick = () => {
    if (onMessageClick) {
      onMessageClick(participant.user_id);
    }
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md">
        <div className="flex items-center space-x-3 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile_avatar_url || undefined} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {displayName} {isCurrentUser && <span className="text-xs text-muted-foreground">(You)</span>}
            </p>
            <Badge variant={getRoleBadgeVariant(role)} className="text-xs">
              {role}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Action buttons */}
          {!isCurrentUser && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMessageClick}
                className="h-8 w-8 p-0"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProfileClick}
                className="h-8 w-8 p-0"
              >
                <User className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {/* Remove button - only shown if current user has permission to remove this participant */}
          <RemoveParticipantButton
            participant={participant} 
            dealId={dealId}
            currentUserRole={currentUserRole}
            dealSellerId={dealSellerId}
            onParticipantRemoved={onParticipantRemoved}
          />
        </div>
      </div>

      {/* Profile Modal */}
      <ParticipantProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        participant={participant}
        onMessageClick={handleMessageClick}
      />
    </>
  );
};

// Helper to determine badge variant based on role
function getRoleBadgeVariant(role: string): "default" | "secondary" | "outline" | "destructive" {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'destructive';
    case 'seller':
      return 'default';
    case 'buyer':
      return 'secondary';
    case 'lawyer':
      return 'outline';
    default:
      return 'outline';
  }
}

export default ParticipantItem;

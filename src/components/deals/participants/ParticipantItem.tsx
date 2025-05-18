
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import RemoveParticipantButton from './RemoveParticipantButton';
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
  onParticipantRemoved?: () => void;
}

const ParticipantItem: React.FC<ParticipantItemProps> = ({ 
  participant,
  isCurrentUser,
  dealId,
  currentUserRole,
  dealSellerId,
  onParticipantRemoved
}) => {
  const { profile_name, profile_avatar_url, role } = participant;
  
  const displayName = profile_name || 'Unknown User';
  const initials = getUserInitials(displayName);

  return (
    <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile_avatar_url || undefined} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">
            {displayName} {isCurrentUser && <span className="text-xs text-muted-foreground">(You)</span>}
          </p>
          <Badge variant={getRoleBadgeVariant(role)} className="text-xs">
            {role}
          </Badge>
        </div>
      </div>
      
      {/* Remove button - only shown if current user has permission to remove this participant */}
      <RemoveParticipantButton
        participant={participant} 
        dealId={dealId}
        currentUserRole={currentUserRole}
        dealSellerId={dealSellerId}
        onParticipantRemoved={onParticipantRemoved}
      />
    </div>
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

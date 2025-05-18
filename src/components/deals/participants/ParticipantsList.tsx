
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import ParticipantItem from './ParticipantItem';
import { DealParticipant } from '@/components/deals/DealParticipants';

interface ParticipantsListProps {
  participants: DealParticipant[];
  currentUserId?: string;
  isLoading: boolean;
  error: string | null;
  dealId: string;
  currentUserRole?: string;
  dealSellerId?: string;
  onParticipantRemoved?: () => void;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  currentUserId,
  isLoading,
  error,
  dealId,
  currentUserRole,
  dealSellerId,
  onParticipantRemoved
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Participants</h3>
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading participants: {error}
        </AlertDescription>
      </Alert>
    );
  }

  const sortedParticipants = [...participants].sort((a, b) => {
    // Sort by role priority (admin > seller > lawyer > buyer)
    const rolePriority = { 'admin': 0, 'seller': 1, 'lawyer': 2, 'buyer': 3 };
    const roleA = rolePriority[a.role.toLowerCase()] ?? 4;
    const roleB = rolePriority[b.role.toLowerCase()] ?? 4;
    
    if (roleA !== roleB) return roleA - roleB;
    
    // Then by name alphabetically
    return (a.profile_name || '').localeCompare(b.profile_name || '');
  });

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Participants ({sortedParticipants.length})</h3>
      {sortedParticipants.length === 0 ? (
        <p className="text-sm text-muted-foreground">No participants found.</p>
      ) : (
        <div className="space-y-1">
          {sortedParticipants.map((participant) => (
            <ParticipantItem 
              key={participant.user_id} 
              participant={participant}
              isCurrentUser={participant.user_id === currentUserId}
              dealId={dealId}
              currentUserRole={currentUserRole}
              dealSellerId={dealSellerId}
              onParticipantRemoved={onParticipantRemoved}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipantsList;

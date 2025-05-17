
import React from "react";
import { DealParticipant } from "../DealParticipants";
import ParticipantItem from "./ParticipantItem";

interface ParticipantsListProps {
  participants: DealParticipant[];
  currentUserId?: string;
  isLoading: boolean;
  error: string | null;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({ 
  participants, 
  currentUserId, 
  isLoading, 
  error 
}) => {
  if (isLoading) {
    return <p className="text-xs text-muted-foreground text-center">Loading participants...</p>;
  }

  if (error) {
    return <p className="text-xs text-red-500 text-center">{error}</p>;
  }

  if (participants.length === 0) {
    return <p className="text-xs text-muted-foreground text-center">No participants found</p>;
  }

  return (
    <div className="space-y-4">
      {participants.map(participant => (
        <ParticipantItem 
          key={participant.user_id}
          participant={participant}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};

export default ParticipantsList;

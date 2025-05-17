
import React from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface InviteParticipantButtonProps {
  onClick: () => void;
  canInviteParticipants: boolean;
}

const InviteParticipantButton: React.FC<InviteParticipantButtonProps> = ({ 
  onClick, 
  canInviteParticipants 
}) => {
  if (!canInviteParticipants) {
    return null;
  }

  return (
    <Button variant="outline" className="w-full text-sm" onClick={onClick}>
      <Users className="h-4 w-4 mr-2" />
      Invite Participant
    </Button>
  );
};

export default InviteParticipantButton;

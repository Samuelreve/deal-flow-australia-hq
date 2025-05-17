
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DealParticipant } from "../DealParticipants";

interface ParticipantItemProps {
  participant: DealParticipant;
  currentUserId?: string;
}

const ParticipantItem: React.FC<ParticipantItemProps> = ({ participant, currentUserId }) => {
  return (
    <div className="flex items-center gap-3">
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
          {currentUserId === participant.user_id && (
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
  );
};

export default ParticipantItem;

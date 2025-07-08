import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Participant {
  user_id: string;
  role: string;
  profile_name: string | null;
  profile_avatar_url: string | null;
  profiles?: {
    name?: string;
    avatar_url?: string;
    email?: string;
  };
}

interface ContactsListProps {
  participants: Participant[];
  currentUserId?: string;
  selectedContactId?: string;
  onContactSelect: (contactId: string | undefined) => void;
  onDealChatSelect: () => void;
}

const ContactsList: React.FC<ContactsListProps> = ({
  participants,
  currentUserId,
  selectedContactId,
  onContactSelect,
  onDealChatSelect
}) => {
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

  // Filter out current user from contacts
  const otherParticipants = participants.filter(p => p.user_id !== currentUserId);

  return (
    <div className="border-r bg-muted/10 h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Messages
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Deal Chat */}
        <div 
          onClick={onDealChatSelect}
          className={cn(
            "p-3 border-b cursor-pointer hover:bg-muted/20 transition-colors",
            !selectedContactId && "bg-primary/10 border-l-4 border-l-primary"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">Deal Chat</div>
              <div className="text-xs text-muted-foreground">
                All participants • {participants.length} members
              </div>
            </div>
          </div>
        </div>

        {/* Individual Contacts */}
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-2">
            PARTICIPANTS
          </div>
          
          {otherParticipants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No other participants to message
            </div>
          ) : (
            otherParticipants.map((participant) => {
              const displayName = participant.profiles?.name || participant.profile_name || 'Unknown User';
              const isSelected = selectedContactId === participant.user_id;
              
              return (
                <div
                  key={participant.user_id}
                  onClick={() => onContactSelect(participant.user_id)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer hover:bg-muted/20 transition-colors mb-1",
                    isSelected && "bg-primary/10 border border-primary/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage 
                        src={participant.profiles?.avatar_url || participant.profile_avatar_url || undefined} 
                        alt={displayName} 
                      />
                      <AvatarFallback className="text-xs">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {displayName}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs mt-1 ${getRoleColor(participant.role)}`}
                      >
                        {participant.role.charAt(0).toUpperCase() + participant.role.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactsList;
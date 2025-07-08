import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare } from "lucide-react";

interface Participant {
  user_id: string;
  role: string;
  profiles?: {
    name?: string;
    avatar_url?: string;
    email?: string;
  };
  profile_name?: string;
}

interface ContactsListProps {
  participants: Participant[];
  currentUserId?: string;
  selectedContactId?: string;
  onContactSelect: (contactId: string) => void;
  onDealChatSelect: () => void;
  unreadCounts?: {
    dealChat: number;
    privateMessages: { [userId: string]: number };
  };
}

const ContactsList: React.FC<ContactsListProps> = ({
  participants,
  currentUserId,
  selectedContactId,
  onContactSelect,
  onDealChatSelect,
  unreadCounts
}) => {
  // Filter out current user from participants list
  const otherParticipants = participants.filter(p => p.user_id !== currentUserId);

  return (
    <div className="border-r bg-muted/5">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Messages
        </h3>
      </div>

      {/* Contacts List */}
      <div className="h-full overflow-y-auto">
        {/* Deal Chat */}
        <Button
          variant={!selectedContactId ? "secondary" : "ghost"}
          className="w-full justify-start p-4 h-auto rounded-none border-b"
          onClick={onDealChatSelect}
        >
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="font-medium">Deal Chat</p>
                  <p className="text-sm text-muted-foreground">
                    All participants • {participants.length} members
                  </p>
                </div>
                {unreadCounts && unreadCounts.dealChat > 0 && (
                  <Badge variant="destructive" className="ml-2 min-w-[20px] h-5 flex items-center justify-center p-1">
                    {unreadCounts.dealChat > 99 ? '99+' : unreadCounts.dealChat}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Button>

        {/* Participants */}
        {otherParticipants.length > 0 && (
          <>
            <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b bg-muted/10">
              Participants
            </div>
            
            {otherParticipants.map((participant) => {
              const displayName = participant.profiles?.name || participant.profile_name || 'Unknown User';
              const isSelected = selectedContactId === participant.user_id;
              const unreadCount = unreadCounts?.privateMessages[participant.user_id] || 0;
              
              return (
                <Button
                  key={participant.user_id}
                  variant={isSelected ? "secondary" : "ghost"}
                  className="w-full justify-start p-4 h-auto rounded-none border-b"
                  onClick={() => onContactSelect(participant.user_id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={participant.profiles?.avatar_url || undefined} 
                        alt={displayName} 
                      />
                      <AvatarFallback className="text-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <p className="font-medium">{displayName}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {participant.role}
                          </p>
                        </div>
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-2 min-w-[20px] h-5 flex items-center justify-center p-1">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default ContactsList;
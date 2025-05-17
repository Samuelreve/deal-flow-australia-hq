
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface MessageItemProps {
  message: {
    id: string;
    content: string;
    created_at: string;
    sender_user_id: string;
    profiles: {
      name: string;
      avatar_url: string | null;
    };
  };
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { user } = useAuth();
  const isCurrentUser = user?.id === message.sender_user_id;
  
  return (
    <div className={`flex gap-2 mb-4 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.profiles.avatar_url || undefined} alt={message.profiles.name} />
        <AvatarFallback>{message.profiles.name.charAt(0)}</AvatarFallback>
      </Avatar>
      
      <div className={`max-w-[75%] ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg px-3 py-2`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium">
            {isCurrentUser ? 'You' : message.profiles.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.created_at), 'MMM d, h:mm a')}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
};

export default MessageItem;

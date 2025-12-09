import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { MessageReactions } from './MessageReactions';
import { MoreVertical, Copy, Trash } from 'lucide-react';
import { toast } from 'sonner';

interface MessageItemProps {
  message: {
    id: string;
    content: string;
    created_at: string;
    sender_user_id: string;
    recipient_user_id?: string | null;
    read_at?: string | null;
    profiles: {
      name: string;
      avatar_url: string | null;
    };
  };
  onDelete?: (messageId: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onDelete }) => {
  const { user } = useAuth();
  const isCurrentUser = user?.id === message.sender_user_id;
  const [showReactions, setShowReactions] = useState(false);

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('Copied to clipboard');
  };
  
  return (
    <div 
      className={`flex gap-3 mb-4 group ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={message.profiles.avatar_url || undefined} alt={message.profiles.name} />
        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs">
          {getInitials(message.profiles.name)}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex-1 max-w-[75%] ${isCurrentUser ? 'items-end' : ''}`}>
        {/* Header */}
        <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-medium">
            {isCurrentUser ? 'You' : message.profiles.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
          
          {/* Unread indicator */}
          {!message.read_at && message.recipient_user_id === user?.id && (
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
          )}
        </div>

        {/* Message Bubble */}
        <div className={`rounded-lg px-3 py-2 ${
          isCurrentUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        }`}>
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Reactions */}
        <MessageReactions 
          messageId={message.id} 
          showAddButton={showReactions}
        />

        {/* Actions Menu (only for own messages) */}
        {isCurrentUser && (
          <div className={`mt-1 h-6 ${isCurrentUser ? 'text-right' : ''}`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isCurrentUser ? 'end' : 'start'} className="bg-popover">
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Text
                </DropdownMenuItem>
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(message.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;

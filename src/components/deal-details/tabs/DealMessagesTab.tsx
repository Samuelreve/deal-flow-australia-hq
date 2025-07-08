import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMessages } from "@/hooks/useMessages";


interface DealMessagesTabProps {
  dealId: string;
}

const DealMessagesTab: React.FC<DealMessagesTabProps> = ({ dealId }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use the real-time enabled useMessages hook
  const { messages, loading, sending, sendMessage: sendMessageHook } = useMessages(dealId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendMessageHook(newMessage);
      setNewMessage('');
    } catch (error) {
      // Error handling is already done in the hook
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-AU', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-AU', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Deal Messages
        </CardTitle>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">Start the conversation with your deal team</p>
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.sender_user_id === user?.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                   <Avatar className="h-8 w-8 flex-shrink-0">
                     <AvatarImage 
                       src={message.profiles?.avatar_url || undefined} 
                       alt={message.profiles?.name || 'User'} 
                     />
                     <AvatarFallback className="text-xs">
                       {(message.profiles?.name || 'U').charAt(0).toUpperCase()}
                     </AvatarFallback>
                   </Avatar>
                  
                  <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                     <div className="flex items-center gap-2 mb-1">
                       <span className="text-xs text-muted-foreground">
                         {isCurrentUser ? 'You' : (message.profiles?.name || 'User')}
                       </span>
                       <span className="text-xs text-muted-foreground">
                         {formatMessageTime(message.created_at)}
                       </span>
                     </div>
                    
                    <div
                      className={`rounded-lg px-3 py-2 max-w-full break-words ${
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
             })
           )}
           {/* Auto-scroll target */}
           <div ref={messagesEndRef} />
         </div>

        {/* Message Input */}
        <div className="flex gap-2 pt-3 border-t">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
            disabled={sending}
          />
           <Button 
             onClick={handleSendMessage}
             disabled={!newMessage.trim() || sending}
             size="sm"
             className="flex items-center gap-1"
           >
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DealMessagesTab;
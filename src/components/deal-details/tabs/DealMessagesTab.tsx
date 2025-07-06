import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Send, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender_user_id: string;
  created_at: string;
  profiles?: {
    name: string;
    avatar_url?: string;
  };
}

interface DealMessagesTabProps {
  dealId: string;
}

const DealMessagesTab: React.FC<DealMessagesTabProps> = ({ dealId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, [dealId]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive"
        });
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          deal_id: dealId,
          content: newMessage.trim(),
          sender_user_id: user.id
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive"
        });
        return;
      }

      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
                      src={message.profiles?.avatar_url} 
                      alt={message.profiles?.name || 'User'} 
                    />
                    <AvatarFallback className="text-xs">
                      {(message.profiles?.name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        {isCurrentUser ? 'You' : 'User'}
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
            onClick={sendMessage}
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
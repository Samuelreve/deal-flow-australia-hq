import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";
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

interface DealMessageInputProps {
  dealId: string;
  onMessageSent: (message: Message) => void;
}

const DealMessageInput: React.FC<DealMessageInputProps> = ({ dealId, onMessageSent }) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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

      onMessageSent(data);
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

  return (
    <div className="border-t p-4">
      <div className="flex gap-2 items-end">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (Shift+Enter for new line)"
          className="flex-1 min-h-[44px] max-h-32 resize-none"
          disabled={sending}
        />
        <Button 
          onClick={sendMessage}
          disabled={!newMessage.trim() || sending}
          size="sm"
          className="flex items-center gap-1 px-3"
        >
          <Send className="h-4 w-4" />
          {sending ? 'Sending...' : 'Send'}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
};

export default DealMessageInput;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  isParticipant: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  isLoading,
  isParticipant
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    try {
      await onSendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!isParticipant) {
    return (
      <div className="p-4 border-t text-center">
        <p className="text-sm text-muted-foreground">
          You need to be a participant in this deal to send messages.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="min-h-[80px] resize-none flex-1"
          disabled={isLoading || !isParticipant}
        />
        <Button 
          type="submit" 
          disabled={!message.trim() || isLoading}
          className="self-end"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </form>
  );
};

export default MessageInput;

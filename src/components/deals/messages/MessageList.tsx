
import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: any[];
  loading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, loading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <p className="mb-2">No messages yet</p>
          <p className="text-sm">Start the conversation by sending a message below</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;

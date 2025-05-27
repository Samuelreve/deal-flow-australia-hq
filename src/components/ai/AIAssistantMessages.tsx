
import React, { useRef, useEffect } from 'react';
import { User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import EnhancedResponseDisplay from './EnhancedResponseDisplay';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  category?: string;
  confidence?: number;
  documentContext?: string;
}

interface AIAssistantMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onFeedback: (messageId: string, helpful: boolean) => void;
}

const AIAssistantMessages: React.FC<AIAssistantMessagesProps> = ({
  messages,
  isLoading,
  onFeedback
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  console.log('Rendering messages:', messages.length, 'Loading:', isLoading);

  return (
    <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
      <div className="space-y-6">
        {messages.map((message) => {
          console.log('Rendering message:', message.id, message.role, message.content.substring(0, 50));
          return (
            <div key={message.id}>
              {message.role === 'user' ? (
                <div className="flex gap-3 justify-end">
                  <div className="max-w-[80%] rounded-lg px-4 py-3 bg-blue-600 text-white">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                    <div className="mt-2 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <EnhancedResponseDisplay
                  content={message.content}
                  category={message.category}
                  confidence={message.confidence}
                  timestamp={message.timestamp}
                  onFeedback={(helpful) => onFeedback(message.id, helpful)}
                />
              )}
            </div>
          );
        })}
        
        {isLoading && (
          <EnhancedResponseDisplay
            content=""
            isLoading={true}
            timestamp={new Date()}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default AIAssistantMessages;

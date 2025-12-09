import React, { useRef, useEffect } from 'react';
import { User, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import StreamingResponseDisplay from './StreamingResponseDisplay';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  category?: string;
  confidence?: number;
  documentContext?: string;
  isStreaming?: boolean;
}

interface EnhancedAIAssistantMessagesProps {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  onFeedback: (messageId: string, helpful: boolean) => void;
  onCancelStream?: () => void;
  onClearHistory?: () => void;
}

const EnhancedAIAssistantMessages: React.FC<EnhancedAIAssistantMessagesProps> = ({
  messages,
  isLoading,
  isStreaming,
  onFeedback,
  onCancelStream,
  onClearHistory
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added or streaming updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isStreaming]);

  // Check if there's history to clear (exclude welcome message)
  const hasHistory = messages.filter(m => m.id !== 'welcome').length > 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with clear button */}
      {hasHistory && onClearHistory && (
        <div className="flex justify-end px-4 py-2 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear History
          </Button>
        </div>
      )}
      
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === 'user' ? (
                <div className="flex gap-3 justify-end">
                  <div className="max-w-[80%] rounded-lg px-4 py-3 bg-primary text-primary-foreground">
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
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ) : (
                <StreamingResponseDisplay
                  content={message.content}
                  category={message.category}
                  confidence={message.confidence}
                  isStreaming={message.isStreaming}
                  isLoading={isLoading && message.isStreaming}
                  onFeedback={(helpful) => onFeedback(message.id, helpful)}
                  onCancel={message.isStreaming ? onCancelStream : undefined}
                  timestamp={message.timestamp}
                />
              )}
            </div>
          ))}
          
          {/* Loading indicator when waiting for stream to start */}
          {isLoading && !messages.some(m => m.isStreaming) && (
            <StreamingResponseDisplay
              content=""
              isLoading={true}
              timestamp={new Date()}
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default EnhancedAIAssistantMessages;

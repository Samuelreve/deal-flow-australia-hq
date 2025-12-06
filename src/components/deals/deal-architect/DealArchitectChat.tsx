import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Sparkles, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useDealArchitect, GeneratedMilestone } from './hooks/useDealArchitect';
import { DealPreview } from './DealPreview';
import { DealCreationData } from '../deal-creation/types';

interface DealArchitectChatProps {
  onDealCreated: (dealData: Partial<DealCreationData>, milestones: GeneratedMilestone[]) => void;
  onCancel: () => void;
}

export function DealArchitectChat({ onDealCreated, onCancel }: DealArchitectChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    dealData,
    milestones,
    isComplete,
    confidence,
    isLoading,
    error,
    sendMessage,
    resetChat,
    toggleMilestone,
    updateMilestone,
    continueConversation
  } = useDealArchitect({
    onComplete: (data, milestones) => {
      console.log('Deal creation ready:', data, milestones);
    }
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput('');
    await sendMessage(message);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleConfirmDeal = () => {
    onDealCreated(dealData, milestones.filter(m => m.selected !== false));
  };

  return (
    <div className="flex flex-col h-full min-h-[600px] max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">AI Deal Architect</h2>
          <p className="text-sm text-muted-foreground">
            Create your deal through conversation
          </p>
        </div>
        {confidence !== 'low' && (
          <Badge 
            variant={confidence === 'high' ? 'default' : 'secondary'}
            className="capitalize"
          >
            {confidence} confidence
          </Badge>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
                <span className="text-xs opacity-60 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Deal Preview (when complete) */}
      {isComplete && Object.keys(dealData).length > 0 && (
        <div className="border-t p-4 bg-muted/30">
          <DealPreview
            dealData={dealData}
            milestones={milestones}
            confidence={confidence}
            onConfirm={handleConfirmDeal}
            onToggleMilestone={toggleMilestone}
            onUpdateMilestone={updateMilestone}
            onContinueChat={continueConversation}
          />
        </div>
      )}

      {/* Input Area */}
      {!isComplete && (
        <div className="border-t p-4 bg-background">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your response..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send • The AI will guide you through deal creation
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DealArchitectChat;

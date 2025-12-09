import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/hooks/document-ai/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { useStreamingAI } from "@/hooks/useStreamingAI";
import { StreamingCursor } from "@/components/ui/streaming-cursor";

interface StreamingChatMessage extends ChatMessage {
  isStreaming?: boolean;
}

interface DealChatAssistantPanelProps {
  dealId: string;
  isParticipant: boolean;
}

const DealChatAssistantPanel: React.FC<DealChatAssistantPanelProps> = ({ 
  dealId, 
  isParticipant 
}) => {
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<StreamingChatMessage[]>([{
    id: uuidv4(),
    role: "assistant",
    content: "Hello! I'm your Deal Assistant. Ask me any questions about this deal, and I'll help you find information based on the deal data.",
    timestamp: Date.now()
  }]);
  
  const { 
    isStreaming, 
    streamedContent, 
    streamDealChat, 
    cancelStream,
    resetStream 
  } = useStreamingAI({
    onError: () => {
      toast({
        title: "Chat Error",
        description: "An error occurred while getting an answer",
        variant: "destructive"
      });
    }
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to the bottom of the chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, streamedContent]);

  // Update streaming message content in real-time
  useEffect(() => {
    if (isStreaming && streamedContent) {
      setChatMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.isStreaming) {
          return prev.map((msg, idx) => 
            idx === prev.length - 1 
              ? { ...msg, content: streamedContent }
              : msg
          );
        }
        return prev;
      });
    }
  }, [streamedContent, isStreaming]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userQuestion.trim()) return;
    if (!isParticipant) {
      toast({
        title: "Access Denied",
        description: "You must be a participant in this deal to use the chat assistant.",
        variant: "destructive"
      });
      return;
    }

    const newUserMessage: StreamingChatMessage = { 
      id: uuidv4(),
      role: 'user', 
      content: userQuestion.trim(),
      timestamp: Date.now()
    };
    
    // Add placeholder streaming message
    const streamingMessage: StreamingChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    };
    
    setChatMessages(prev => [...prev, newUserMessage, streamingMessage]);
    const currentQuestion = userQuestion.trim();
    setUserQuestion("");
    resetStream();

    try {
      // Build chat history for context
      const chatHistory = chatMessages
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }));

      const finalContent = await streamDealChat(dealId, currentQuestion, chatHistory);

      // Finalize the streaming message
      setChatMessages(prev => prev.map((msg, idx) => 
        idx === prev.length - 1 && msg.isStreaming
          ? {
              ...msg,
              content: finalContent || "I'm sorry, I couldn't process your question. Please try asking in a different way.",
              isStreaming: false
            }
          : msg
      ));
    } catch (error) {
      console.error('Deal chat query failed:', error);
      
      // Update the streaming message to show error
      setChatMessages(prev => prev.map((msg, idx) => 
        idx === prev.length - 1 && msg.isStreaming
          ? {
              ...msg,
              content: 'Sorry, I encountered an error while processing your question. Please try again later.',
              isStreaming: false
            }
          : msg
      ));
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[calc(100vh-200px)]">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20 rounded-t-md">
        {chatMessages.map((msg, idx) => (
          <div 
            key={idx} 
            className={cn(
              "flex items-start gap-2 animate-fadeIn",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <Bot size={16} />
              </div>
            )}
            
            <div 
              className={cn(
                "rounded-lg p-3 max-w-[80%]",
                msg.role === 'user' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted"
              )}
            >
              <div className="whitespace-pre-line text-sm">
                {msg.content}
                {msg.isStreaming && <StreamingCursor />}
              </div>
              {msg.timestamp && (
                <div className="text-xs opacity-70 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
            
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-sm font-medium">You</span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSendMessage} className="p-2 bg-background border-t">
        <div className="flex gap-2">
          {isStreaming && (
            <Button
              variant="outline"
              size="icon"
              onClick={cancelStream}
              className="text-destructive"
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          )}
          <Textarea
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="Ask a question about this deal..."
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            disabled={isStreaming || !isParticipant}
          />
          
          <Button 
            type="submit" 
            size="icon" 
            disabled={isStreaming || !userQuestion.trim() || !isParticipant}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z"/>
              <path d="M22 2 11 13"/>
            </svg>
          </Button>
        </div>
        
        {!isParticipant && (
          <div className="mt-2 text-xs text-destructive">
            You must be a participant in this deal to use the chat assistant.
          </div>
        )}
        
        <div className="mt-2 text-xs text-muted-foreground">
          AI responses are generated based on deal data and may not be complete. Not legal or financial advice.
        </div>
      </form>
    </div>
  );
};

export default DealChatAssistantPanel;

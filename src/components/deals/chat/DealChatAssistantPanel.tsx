
import React, { useState, useRef, useEffect } from "react";
import { useDocumentAI } from "@/hooks/document-ai/useDocumentAI";
import { ChatMessage } from "@/hooks/document-ai/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface DealChatAssistantPanelProps {
  dealId: string;
  isParticipant: boolean;
}

const DealChatAssistantPanel: React.FC<DealChatAssistantPanelProps> = ({ 
  dealId, 
  isParticipant 
}) => {
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
    sender: "ai",
    content: "Hello! I'm your Deal Assistant. Ask me any questions about this deal, and I'll help you find information based on the deal data.",
    timestamp: new Date()
  }]);
  
  const { dealChatQuery, loading } = useDocumentAI({ dealId });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to the bottom of the chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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

    const newUserMessage = { 
      sender: 'user' as const, 
      content: userQuestion.trim(),
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newUserMessage]);
    setUserQuestion("");

    try {
      // Call the AI assistant method with the most recent 4 messages for context
      const recentHistory = chatMessages.slice(-4);
      const result = await dealChatQuery(dealId, userQuestion.trim(), recentHistory);

      if (result && 'answer' in result) {
        setChatMessages(prev => [...prev, { 
          sender: 'ai', 
          content: result.answer,
          timestamp: new Date()
        }]);
      } else {
        setChatMessages(prev => [...prev, { 
          sender: 'ai', 
          content: "I'm sorry, I couldn't process your question. Please try asking in a different way.",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Deal chat query failed:', error);
      setChatMessages(prev => [...prev, { 
        sender: 'ai', 
        content: 'Sorry, I encountered an error while processing your question. Please try again later.',
        timestamp: new Date()
      }]);
      
      toast({
        title: "Chat Error",
        description: error instanceof Error ? error.message : "An error occurred while getting an answer",
        variant: "destructive"
      });
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
              msg.sender === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <Bot size={16} />
              </div>
            )}
            
            <div 
              className={cn(
                "rounded-lg p-3 max-w-[80%]",
                msg.sender === 'user' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted"
              )}
            >
              <div className="whitespace-pre-line text-sm">{msg.content}</div>
              {msg.timestamp && (
                <div className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
            
            {msg.sender === 'user' && (
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
            disabled={loading || !isParticipant}
          />
          
          <Button 
            type="submit" 
            size="icon" 
            disabled={loading || !userQuestion.trim() || !isParticipant}
          >
            <SendIcon size={18} />
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

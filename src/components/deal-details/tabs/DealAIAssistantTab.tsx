import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Sparkles, TrendingUp, AlertTriangle, FileText, StopCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStreamingAI } from "@/hooks/useStreamingAI";
import { toast } from "sonner";
import { useDealContext } from "@/hooks/deals/useDealContext";
import { StreamingCursor } from "@/components/ui/streaming-cursor";

interface Deal {
  id: string;
  title: string;
  description?: string;
  status: string;
  health_score: number;
  asking_price?: number;
  business_industry?: string;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  isStreaming?: boolean;
}

interface DealAIAssistantTabProps {
  dealId: string;
  deal: Deal;
}

const DealAIAssistantTab: React.FC<DealAIAssistantTabProps> = ({ dealId, deal }) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch comprehensive deal context
  const dealContext = useDealContext(dealId);
  
  // Initialize streaming AI
  const { 
    isStreaming, 
    streamedContent, 
    streamDealChat, 
    cancelStream,
    resetStream 
  } = useStreamingAI({
    onError: (error) => {
      toast.error('Failed to get AI response. Please try again.');
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedContent]);

  // Update streaming message content in real-time
  useEffect(() => {
    if (isStreaming && streamedContent) {
      setMessages(prev => {
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

  // Initialize with a welcome message
  useEffect(() => {
    const welcomeMessage: AIMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your AI assistant for the "${deal.title}" deal. I have access to your deal's complete information including:

• Deal details, status, and health score (${deal.health_score}/100)
• All milestones and their current progress
• Uploaded documents and their status  
• Participant information and roles
• Recent activity and comments
• Health score history and trends

I can provide insights on deal progress, suggest next actions, analyze documents, assess risks, and answer specific questions about your deal. 

What would you like to know about this deal?`,
      timestamp: new Date(),
      suggestions: [
        'What should be my next action?',
        'Analyze the deal health score',
        'Review deal documents',
        'Check milestone progress'
      ]
    };
    
    setMessages([welcomeMessage]);
  }, [deal.title, deal.health_score]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isStreaming) return;

    // Add user message
    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: newMessage.trim(),
      timestamp: new Date()
    };

    // Add placeholder streaming message
    const streamingMessage: AIMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, userMessage, streamingMessage]);
    const currentMessage = newMessage.trim();
    setNewMessage('');
    resetStream();

    try {
      // Build chat history for context
      const chatHistory = messages
        .filter(m => m.id !== 'welcome')
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }));

      const finalContent = await streamDealChat(dealId, currentMessage, chatHistory);
      
      // Finalize the streaming message
      setMessages(prev => prev.map((msg, idx) => 
        idx === prev.length - 1 && msg.isStreaming
          ? {
              ...msg,
              content: finalContent || 'I apologize, but I encountered an issue processing your request.',
              isStreaming: false,
              suggestions: [
                'What should be my next action?',
                'Analyze the deal health score',
                'Review deal documents',
                'Compare to industry standards'
              ]
            }
          : msg
      ));
    } catch (error) {
      console.error('AI response error:', error);
      
      // Update the streaming message to show error
      setMessages(prev => prev.map((msg, idx) => 
        idx === prev.length - 1 && msg.isStreaming
          ? {
              ...msg,
              content: 'I apologize, but I encountered an error processing your request. Please try again.',
              isStreaming: false
            }
          : msg
      ));
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setNewMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          AI Deal Assistant
          <Badge variant="outline" className="ml-2">
            Powered by AI
          </Badge>
        </CardTitle>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                {message.role === 'assistant' ? (
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className={`flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">
                    {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatMessageTime(message.timestamp)}
                  </span>
                </div>
                
                <div
                  className={`rounded-lg px-4 py-3 max-w-full ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted border'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                    {message.isStreaming && <StreamingCursor />}
                  </div>
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex gap-2 pt-3 border-t">
          {isStreaming && (
            <Button
              variant="outline"
              size="sm"
              onClick={cancelStream}
              className="flex items-center gap-1 text-destructive"
            >
              <StopCircle className="h-4 w-4" />
              Stop
            </Button>
          )}
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask me anything about this deal..."
            className="flex-1"
            disabled={isStreaming}
          />
          <Button 
            onClick={sendMessage}
            disabled={!newMessage.trim() || isStreaming}
            size="sm"
            className="flex items-center gap-1"
          >
            <Send className="h-4 w-4" />
            {isStreaming ? 'Thinking...' : 'Ask AI'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DealAIAssistantTab;
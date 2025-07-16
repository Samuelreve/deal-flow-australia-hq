import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Sparkles, TrendingUp, AlertTriangle, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentAI } from "@/hooks/useDocumentAI";
import { toast } from "sonner";
import { useDealContext } from "@/hooks/deals/useDealContext";

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
}

interface DealAIAssistantTabProps {
  dealId: string;
  deal: Deal;
}

const DealAIAssistantTab: React.FC<DealAIAssistantTabProps> = ({ dealId, deal }) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  
  // Fetch comprehensive deal context
  const dealContext = useDealContext(dealId);
  
  // Initialize AI operations
  const { dealChatQuery, loading } = useDocumentAI({ 
    dealId, 
    documentId: undefined 
  });

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
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: newMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage.trim();
    setNewMessage('');
    setIsTyping(true);

    try {
      // Use real AI response with comprehensive deal context
      const aiResponse = await dealChatQuery(dealId, currentMessage, dealContext);
      
      if (aiResponse) {
        const aiMessage: AIMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: aiResponse.answer || aiResponse.chatResponse || aiResponse.explanation || aiResponse.summary || 'I apologize, but I encountered an issue processing your request.',
          timestamp: new Date(),
          suggestions: [
            'What should be my next action?',
            'Analyze the deal health score',
            'Review deal documents',
            'Compare to industry standards'
          ]
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Fallback message if AI response fails
        const fallbackMessage: AIMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: 'I apologize, but I\'m currently unable to process your request. Please try again later.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (error) {
      console.error('AI response error:', error);
      toast.error('Failed to get AI response. Please try again.');
      
      // Add error message to chat
      const errorMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
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
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  
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
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="flex gap-2 pt-3 border-t">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about this deal..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button 
            onClick={sendMessage}
            disabled={!newMessage.trim() || isTyping}
            size="sm"
            className="flex items-center gap-1"
          >
            <Send className="h-4 w-4" />
            Ask AI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DealAIAssistantTab;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Sparkles, TrendingUp, AlertTriangle, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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

  // Initialize with a welcome message
  useEffect(() => {
    const welcomeMessage: AIMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your AI assistant for the "${deal.title}" deal. I can help you with:
      
• Analyzing deal progress and health score
• Suggesting next actions and milestones
• Reviewing documents and contracts
• Providing industry insights
• Answering questions about deal structure

What would you like to know about this deal?`,
      timestamp: new Date(),
      suggestions: [
        'What should be my next action?',
        'Analyze the deal health score',
        'Review deal documents',
        'Compare to industry standards'
      ]
    };
    
    setMessages([welcomeMessage]);
  }, [deal.title]);

  const simulateAIResponse = (userMessage: string): AIMessage => {
    let content = '';
    let suggestions: string[] = [];

    // Simple response simulation based on keywords
    const message = userMessage.toLowerCase();
    
    if (message.includes('health') || message.includes('score')) {
      content = `Based on your deal's current health score of ${deal.health_score}/100, here's my analysis:

${deal.health_score >= 80 ? '✅ **Excellent Progress**' : 
  deal.health_score >= 60 ? '⚠️ **Good Progress with Room for Improvement**' : 
  '🚨 **Requires Attention**'}

Key factors affecting your score:
• Deal status: ${deal.status}
• Documentation completeness
• Milestone progress
• Participant engagement

${deal.health_score < 80 ? 'Recommended actions to improve your score:' : 'Keep up the great work! Consider:'}
• Complete pending milestones
• Upload missing documentation
• Engage with all participants
• Schedule regular check-ins`;

      suggestions = [
        'Show improvement recommendations',
        'Compare to similar deals',
        'Set health alerts'
      ];
    } else if (message.includes('next') || message.includes('action')) {
      content = `Based on your deal's current status (${deal.status}) and progress, here are my recommended next actions:

**Immediate Actions:**
1. 📋 Review and complete any pending milestones
2. 📄 Ensure all required documents are uploaded and reviewed
3. 👥 Check that all key participants are engaged
4. 💬 Send status updates to stakeholders

**Strategic Actions:**
1. 🎯 Set realistic completion timeline
2. 🔍 Conduct thorough due diligence review
3. 💰 Finalize pricing and terms
4. ⚖️ Engage legal counsel for contract review

Would you like me to elaborate on any of these actions?`;

      suggestions = [
        'Show milestone details',
        'Review document requirements',
        'Contact participants'
      ];
    } else if (message.includes('document') || message.includes('contract')) {
      content = `I can help you with document analysis and management:

**Current Document Status:**
• Documents uploaded and ready for review
• AI-powered analysis available for contracts
• Version control and comparison features

**Document Recommendations:**
1. 📊 **Financial Documents**: P&L statements, balance sheets, tax returns
2. 📋 **Legal Documents**: Articles of incorporation, contracts, leases
3. 🏢 **Operational Documents**: Employee agreements, vendor contracts
4. 🔍 **Due Diligence**: Insurance policies, compliance certificates

I can analyze uploaded documents for:
• Key terms and clauses
• Potential risks and red flags
• Compliance requirements
• Missing information`;

      suggestions = [
        'Analyze uploaded documents',
        'Check document completeness',
        'Review contract terms'
      ];
    } else if (message.includes('industry') || message.includes('benchmark')) {
      content = `Here's how your ${deal.business_industry || 'business'} deal compares to industry standards:

**Industry Insights:**
• Average deal completion time: 3-6 months
• Typical due diligence period: 30-45 days
• Common valuation multiples vary by sector
• Standard contingencies and warranties

**Your Deal vs. Industry:**
${deal.asking_price ? `• Asking price: ${new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(deal.asking_price)}` : '• Pricing: Under evaluation'}
• Health score: ${deal.health_score}/100 (Industry avg: 65-75)
• Current status: ${deal.status}

**Recommendations:**
• Ensure competitive positioning
• Address any gaps in documentation
• Consider market timing factors`;

      suggestions = [
        'Get market analysis',
        'Review pricing strategy',
        'Check competition'
      ];
    } else {
      // Default response
      content = `I understand you're asking about "${userMessage}". Let me help you with that.

As your AI assistant for the "${deal.title}" deal, I have access to:
• Deal structure and terms
• Progress tracking and milestones
• Document analysis capabilities
• Industry benchmarking data
• Risk assessment tools

Could you be more specific about what you'd like to know? I can provide detailed insights on deal progress, document analysis, next steps, or industry comparisons.`;

      suggestions = [
        'Analyze deal health',
        'Review next actions',
        'Check document status',
        'Get industry insights'
      ];
    }

    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      suggestions
    };
  };

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
    setNewMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = simulateAIResponse(userMessage.content);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
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
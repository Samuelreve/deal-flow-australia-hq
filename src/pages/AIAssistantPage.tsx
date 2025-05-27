
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const AIAssistantPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      content: "Hello! I'm your AI Business Assistant specializing in business transactions, legal analysis, and deal optimization. I can help with:\n\n• **Contract Analysis** - Review terms, identify risks, and explain legal clauses\n• **Deal Evaluation** - Assess business opportunities and valuations\n• **Due Diligence** - Guide you through buyer/seller checklists\n• **Risk Assessment** - Identify potential legal and financial risks\n• **Business Strategy** - Provide insights for negotiations and deal structure\n\nWhat business challenge can I help you with today?",
      role: 'assistant',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simulate AI response with business-specific logic
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const aiResponse = generateBusinessAIResponse(inputValue);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const generateBusinessAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Legal/Contract Analysis
    if (input.includes('contract') || input.includes('legal') || input.includes('clause') || input.includes('terms')) {
      return "**Contract Analysis Assistance**\n\nI can help you with contract review and legal analysis. Here's my approach:\n\n• **Key Terms Review** - Identify payment terms, deliverables, and timelines\n• **Risk Assessment** - Flag potential legal risks and ambiguous language\n• **Compliance Check** - Ensure alignment with regulatory requirements\n• **Negotiation Points** - Suggest areas for improvement or clarification\n\nFor specific contract analysis, please share the relevant clauses or sections you'd like me to review. Remember: This is for informational purposes only and doesn't replace professional legal advice.";
    }
    
    // Business Valuation/Due Diligence
    if (input.includes('valuation') || input.includes('due diligence') || input.includes('financial') || input.includes('revenue')) {
      return "**Business Valuation & Due Diligence**\n\nI can guide you through comprehensive business evaluation:\n\n• **Financial Analysis** - Review revenue, EBITDA, cash flow patterns\n• **Market Position** - Assess competitive landscape and growth potential\n• **Asset Evaluation** - Tangible and intangible asset assessment\n• **Risk Factors** - Identify operational, financial, and market risks\n• **Valuation Methods** - DCF, comparable company analysis, asset-based approaches\n\n**Key Due Diligence Areas:**\n- Financial statements and tax returns (3-5 years)\n- Customer concentration and retention rates\n- Legal compliance and pending litigation\n- Management team and key employee dependencies\n- Technology and intellectual property assets\n\nWhat specific aspect of the business would you like to evaluate?";
    }
    
    // Buyer Guidance
    if (input.includes('buyer') || input.includes('buying') || input.includes('acquisition') || input.includes('purchase')) {
      return "**Buyer's Guide to Business Acquisition**\n\nAs a buyer, here are critical steps to ensure a successful acquisition:\n\n**Pre-Purchase Phase:**\n• Define acquisition criteria and budget limits\n• Engage qualified advisors (lawyer, accountant, broker)\n• Secure financing pre-approval\n• Identify target businesses and conduct initial screening\n\n**Due Diligence Checklist:**\n• Financial performance verification\n• Legal structure and compliance review\n• Operational assessment and staff evaluation\n• Market analysis and competition review\n• Technology and systems audit\n\n**Negotiation Strategy:**\n• Structure deal terms (asset vs. stock purchase)\n• Plan for earnouts and seller financing\n• Address transition and training periods\n• Include appropriate warranties and representations\n\nWhat stage of the buying process are you currently in?";
    }
    
    // Seller Guidance
    if (input.includes('seller') || input.includes('selling') || input.includes('exit') || input.includes('sale')) {
      return "**Seller's Guide to Business Exit Strategy**\n\nPreparing for a successful business sale requires strategic planning:\n\n**Pre-Sale Preparation (6-12 months):**\n• Clean up financial records and systems\n• Optimize business operations for maximum value\n• Address any legal or compliance issues\n• Develop management team independence\n• Prepare comprehensive information memorandum\n\n**Valuation Optimization:**\n• Improve EBITDA through cost management\n• Diversify customer base and revenue streams\n• Document all processes and procedures\n• Strengthen competitive positioning\n• Ensure clean legal structure\n\n**Sale Process Management:**\n• Engage experienced M&A advisor\n• Develop targeted buyer list\n• Manage confidentiality throughout process\n• Negotiate optimal deal structure\n• Plan for smooth transition period\n\nWhat's your timeline for the sale, and what's the current state of your business preparation?";
    }
    
    // Risk Assessment
    if (input.includes('risk') || input.includes('liability') || input.includes('insurance') || input.includes('compliance')) {
      return "**Risk Assessment Framework**\n\nComprehensive risk analysis for business transactions:\n\n**Legal Risks:**\n• Regulatory compliance gaps\n• Pending or potential litigation\n• Intellectual property vulnerabilities\n• Employment law compliance\n• Environmental liabilities\n\n**Financial Risks:**\n• Customer concentration risk\n• Working capital fluctuations\n• Debt structure and covenants\n• Currency and interest rate exposure\n• Tax compliance and optimization\n\n**Operational Risks:**\n• Key person dependencies\n• Supply chain vulnerabilities\n• Technology and cybersecurity\n• Market competition and disruption\n• Regulatory changes\n\n**Mitigation Strategies:**\n• Insurance coverage analysis\n• Contractual protections and warranties\n• Escrow and holdback provisions\n• Transition planning and documentation\n\nWhich risk category would you like to explore in more detail?";
    }
    
    // Business Strategy/Negotiation
    if (input.includes('strategy') || input.includes('negotiation') || input.includes('structure') || input.includes('terms')) {
      return "**Business Strategy & Deal Structuring**\n\nStrategic approach to successful business transactions:\n\n**Deal Structure Options:**\n• **Asset Purchase** - Buy specific assets, avoid liabilities\n• **Stock Purchase** - Acquire entire entity, including liabilities\n• **Merger** - Combine entities for strategic synergies\n• **Management Buyout** - Internal team acquires business\n\n**Key Negotiation Points:**\n• Purchase price and payment terms\n• Representations, warranties, and indemnifications\n• Employment agreements and non-compete clauses\n• Transition period and seller involvement\n• Earnout provisions based on future performance\n\n**Value Creation Strategies:**\n• Identify operational synergies\n• Plan for market expansion opportunities\n• Optimize capital structure\n• Develop integration timeline\n• Establish performance metrics\n\nWhat specific aspect of deal strategy would you like to discuss?";
    }
    
    // General business questions
    if (input.includes('help') || input.includes('start') || input.includes('advice')) {
      return "**Business Advisory Services**\n\nI'm here to provide expert guidance across all aspects of business transactions:\n\n**My Expertise Areas:**\n• **Legal Analysis** - Contract review, compliance, risk assessment\n• **Financial Evaluation** - Valuation, due diligence, financial modeling\n• **Strategic Planning** - Deal structure, negotiation strategy, integration\n• **Process Management** - Transaction timeline, stakeholder coordination\n\n**Common Questions I Help With:**\n• \"What should I look for in this contract?\"\n• \"How do I value this business opportunity?\"\n• \"What are the key risks in this transaction?\"\n• \"How should I structure this deal?\"\n• \"What's missing from my due diligence?\"\n\n**Getting Started:**\nSimply describe your situation, share relevant documents or details, and I'll provide tailored analysis and recommendations.\n\nWhat specific business challenge can I help you tackle today?";
    }
    
    // Default response with business focus
    return "**Let me help with your business question!**\n\nI specialize in providing strategic guidance for:\n\n• **Lawyers** - Contract analysis, risk assessment, compliance review\n• **Business Analysts** - Financial modeling, market analysis, due diligence\n• **Buyers** - Acquisition strategy, valuation, negotiation tactics\n• **Sellers** - Exit planning, value optimization, deal structuring\n\nTo provide the most relevant assistance, could you share more details about:\n- Your role in the transaction\n- The specific challenge you're facing\n- Any relevant context or documents\n- Your timeline and objectives\n\nThe more specific your question, the more targeted and valuable my response will be!";
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Business Assistant</h1>
                <p className="text-gray-600">Expert guidance for lawyers, analysts, buyers & sellers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="container mx-auto px-4 py-6 max-w-4xl h-[calc(100vh-200px)]">
          <Card className="h-full flex flex-col shadow-lg">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
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

                    {message.role === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        </div>
                        <span className="text-sm text-gray-600">AI is analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t bg-gray-50 p-4">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask about contracts, valuations, due diligence, deal structure..."
                    disabled={isLoading}
                    className="min-h-[44px] resize-none bg-white"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AIAssistantPage;

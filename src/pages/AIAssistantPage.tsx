
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import EnhancedResponseDisplay from '@/components/ai/EnhancedResponseDisplay';
import { useBusinessCategoryDetection } from '@/hooks/ai/useBusinessCategoryDetection';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  category?: string;
  confidence?: number;
  documentContext?: string;
}

const AIAssistantPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<{ name: string; content: string } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { detectCategory } = useBusinessCategoryDetection();

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
      content: `Welcome to your AI Business Assistant! I'm powered by advanced AI technology and specialize in helping with:

**Business Strategy & Planning**
• Market analysis and competitive positioning
• Growth strategies and expansion planning
• Strategic decision-making frameworks

**Deal Management & Negotiations**
• Deal structuring and terms analysis
• Negotiation strategies and tactics
• Risk assessment and mitigation

**Contract & Document Analysis**
• Contract review and clause interpretation
• Legal risk identification (informational only)
• Document summarization and key insights

**Financial Analysis & Planning**
• Financial modeling and projections
• Valuation methods and pricing strategies
• Investment analysis and ROI calculations

You can ask me questions directly, or upload a document for analysis. What business challenge can I help you with today?`,
      role: 'assistant',
      timestamp: new Date(),
      category: 'strategy'
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['.txt', '.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Please upload a text, PDF, or Word document');
      return;
    }

    try {
      let content = '';
      
      if (file.type === 'text/plain') {
        content = await file.text();
      } else {
        // For demo purposes, we'll show that the file was uploaded
        // In a real implementation, you'd use a proper PDF/Word parser
        content = `[Document uploaded: ${file.name}] - Full document parsing would be implemented here with proper PDF/Word extraction libraries.`;
      }

      setUploadedDocument({
        name: file.name,
        content: content
      });

      toast.success(`Document "${file.name}" uploaded successfully!`);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Failed to read the document');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Detect category from user input
    const detection = detectCategory(inputValue);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
      documentContext: uploadedDocument?.content
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      console.log('Sending message to AI assistant:', { 
        message: currentInput, 
        category: detection.category,
        hasDocument: !!uploadedDocument 
      });
      
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: currentInput,
          category: detection.category,
          documentContext: uploadedDocument?.content
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'AI service returned an error');
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
        category: detection.category,
        confidence: detection.confidence
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment, or contact support if the issue persists.",
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
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

  const handleFeedback = (messageId: string, helpful: boolean) => {
    console.log(`Feedback for message ${messageId}: ${helpful ? 'helpful' : 'not helpful'}`);
    toast.success(helpful ? 'Thanks for your feedback!' : 'Thanks for your feedback. We\'ll work to improve!');
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">AI Business Assistant</h1>
                <p className="text-gray-600">Expert business guidance powered by GPT-4o-mini</p>
              </div>
              
              {/* Document Upload */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            </div>
            
            {/* Document indicator */}
            {uploadedDocument && (
              <Alert className="mt-4 bg-green-50 border-green-200">
                <FileText className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Document loaded:</strong> {uploadedDocument.name} - I can now answer questions about this document.
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedDocument(null)}
                    className="ml-2 h-6 text-xs"
                  >
                    Remove
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Chat Container */}
        <div className="container mx-auto px-4 py-6 max-w-4xl h-[calc(100vh-280px)]">
          <Card className="h-full flex flex-col shadow-lg">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.map((message) => (
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
                        onFeedback={(helpful) => handleFeedback(message.id, helpful)}
                      />
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <EnhancedResponseDisplay
                    content=""
                    isLoading={true}
                    timestamp={new Date()}
                  />
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
                    placeholder={uploadedDocument 
                      ? "Ask me anything about your document or general business questions..."
                      : "Ask me about business strategy, deals, contracts, finance, or upload a document..."
                    }
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
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Powered by OpenAI GPT-4o-mini • Professional business guidance • Not a substitute for professional advice
                </p>
                {uploadedDocument && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <FileText className="h-3 w-3" />
                    Document context active
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AIAssistantPage;

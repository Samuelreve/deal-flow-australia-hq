import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessCategoryDetection } from './useBusinessCategoryDetection';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  category?: string;
  confidence?: number;
  documentContext?: string;
}

export const useAIConversation = (documentContent?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { detectCategory } = useBusinessCategoryDetection();

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      content: `Welcome! I'm your AI Business Assistant — here to help with strategy, deals, documents, and finance.

What I can do:
📈 Strategy — Market insights, growth planning  
🤝 Deals — Term analysis, negotiation tips  
📄 Contracts — Clause summaries, key risks  
💰 Finance — Projections, valuation, ROI

Get started:  
Ask a question like "What's the risk in this contract?" or upload a document for instant insights.

What can I help you with today?`,
      role: 'assistant',
      timestamp: new Date(),
      category: 'strategy'
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Detect category from user input
    const detection = detectCategory(inputValue);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
      documentContext: documentContent
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      console.log('Sending message to AI assistant:', { 
        message: currentInput, 
        category: detection.category,
        hasDocument: !!documentContent 
      });
      
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: currentInput,
          category: detection.category,
          documentContext: documentContent
        }
      });

      console.log('AI assistant response:', data);

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      if (!data) {
        throw new Error('No data received from AI service');
      }

      if (!data.success) {
        throw new Error(data.error || 'AI service returned an error');
      }

      if (!data.response) {
        throw new Error('No response content received from AI service');
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
        category: detection.category,
        confidence: detection.confidence
      };

      console.log('Adding assistant message:', assistantMessage);
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

  const handleFeedback = (messageId: string, helpful: boolean) => {
    console.log(`Feedback for message ${messageId}: ${helpful ? 'helpful' : 'not helpful'}`);
    toast.success(helpful ? 'Thanks for your feedback!' : 'Thanks for your feedback. We\'ll work to improve!');
  };

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    handleSendMessage,
    handleFeedback
  };
};

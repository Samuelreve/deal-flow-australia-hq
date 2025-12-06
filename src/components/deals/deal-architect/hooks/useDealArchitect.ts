import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DealCreationData } from '../../deal-creation/types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface GeneratedMilestone {
  name: string;
  description: string;
  order: number;
  selected?: boolean;
}

interface DealArchitectState {
  dealData: Partial<DealCreationData>;
  milestones: GeneratedMilestone[];
  isComplete: boolean;
  confidence: 'low' | 'medium' | 'high';
}

interface UseDealArchitectOptions {
  onComplete?: (dealData: Partial<DealCreationData>, milestones: GeneratedMilestone[]) => void;
}

export function useDealArchitect(options?: UseDealArchitectOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial',
      role: 'assistant',
      content: "Hi! I'm your AI Deal Architect. Tell me about your deal - what are you selling or buying? I'll help you set up everything in just a few minutes.",
      timestamp: new Date()
    }
  ]);
  
  const [state, setState] = useState<DealArchitectState>({
    dealData: {},
    milestones: [],
    isComplete: false,
    confidence: 'low'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build conversation history for the AI
  const buildConversationHistory = useCallback(() => {
    return messages
      .filter(m => m.id !== 'initial') // Skip the initial greeting
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));
  }, [messages]);

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!content.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('deal-architect-chat', {
        body: {
          message: content,
          conversationHistory: buildConversationHistory(),
          currentDealData: state.dealData
        }
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Failed to get AI response');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message || "I'm processing your request...",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Update state with any new deal data
      if (data.dealData) {
        setState(prev => ({
          ...prev,
          dealData: { ...prev.dealData, ...data.dealData },
          milestones: data.milestones?.map((m: any, i: number) => ({
            ...m,
            selected: true,
            order: m.order || i + 1
          })) || prev.milestones,
          isComplete: data.isComplete || false,
          confidence: data.confidence || prev.confidence
        }));

        // If complete, call the callback
        if (data.isComplete && options?.onComplete) {
          options.onComplete(
            { ...state.dealData, ...data.dealData },
            data.milestones || []
          );
        }
      }

    } catch (err) {
      console.error('Deal Architect error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      
      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `I'm sorry, I encountered an issue: ${errorMessage}. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, buildConversationHistory, state.dealData, options]);

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: 'initial',
        role: 'assistant',
        content: "Hi! I'm your AI Deal Architect. Tell me about your deal - what are you selling or buying? I'll help you set up everything in just a few minutes.",
        timestamp: new Date()
      }
    ]);
    setState({
      dealData: {},
      milestones: [],
      isComplete: false,
      confidence: 'low'
    });
    setError(null);
  }, []);

  const toggleMilestone = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      milestones: prev.milestones.map((m, i) => 
        i === index ? { ...m, selected: !m.selected } : m
      )
    }));
  }, []);

  const updateMilestone = useCallback((index: number, updates: Partial<GeneratedMilestone>) => {
    setState(prev => ({
      ...prev,
      milestones: prev.milestones.map((m, i) => 
        i === index ? { ...m, ...updates } : m
      )
    }));
  }, []);

  const continueConversation = useCallback(() => {
    setState(prev => ({
      ...prev,
      isComplete: false
    }));
    
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: "Sure! What would you like to change or add to this deal?",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, assistantMessage]);
  }, []);

  return {
    messages,
    dealData: state.dealData,
    milestones: state.milestones,
    isComplete: state.isComplete,
    confidence: state.confidence,
    isLoading,
    error,
    sendMessage,
    resetChat,
    toggleMilestone,
    updateMilestone,
    continueConversation
  };
}

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ConversationalMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationalState {
  phase: 'select_type' | 'gathering' | 'confirming' | 'generating' | 'complete';
  documentType: string | null;
  gatheredAnswers: Record<string, any>;
  currentQuestionIndex: number;
}

interface QuickOption {
  label: string;
  value: string;
  description?: string;
}

interface ConversationalDocGenState {
  messages: ConversationalMessage[];
  state: ConversationalState;
  options: QuickOption[];
  isLoading: boolean;
  isComplete: boolean;
  generatedDocument: string | null;
  disclaimer: string | null;
  error: string | null;
}

const initialConversationalState: ConversationalState = {
  phase: 'select_type',
  documentType: null,
  gatheredAnswers: {},
  currentQuestionIndex: 0
};

export function useConversationalDocGen(dealId: string) {
  const { user } = useAuth();
  const [state, setState] = useState<ConversationalDocGenState>({
    messages: [],
    state: initialConversationalState,
    options: [],
    isLoading: false,
    isComplete: false,
    generatedDocument: null,
    disclaimer: null,
    error: null
  });

  const sendMessage = useCallback(async (content: string) => {
    if (!user || !content.trim()) return;

    const userMessage: ConversationalMessage = { role: 'user', content };
    const newMessages = [...state.messages, userMessage];

    setState(prev => ({
      ...prev,
      messages: newMessages,
      isLoading: true,
      error: null
    }));

    try {
      const { data: deal } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();

      const { data: result, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'conversational_template',
          dealId,
          userId: user.id,
          messages: newMessages,
          conversationalState: state.state,
          context: {
            dealContext: {
              title: deal?.title,
              businessName: deal?.business_legal_name,
              askingPrice: deal?.asking_price,
              dealType: deal?.deal_type,
              industry: deal?.business_industry,
              counterpartyName: deal?.counterparty_name
            }
          }
        }
      });

      if (error) throw error;

      const assistantMessage: ConversationalMessage = { 
        role: 'assistant', 
        content: result.message 
      };

      setState(prev => ({
        ...prev,
        messages: [...newMessages, assistantMessage],
        state: result.state || prev.state,
        options: result.options || [],
        isLoading: false,
        isComplete: result.isComplete || false,
        generatedDocument: result.generatedDocument || null,
        disclaimer: result.disclaimer || null
      }));

    } catch (error: any) {
      console.error('Conversational doc gen error:', error);
      toast.error('Failed to process request');
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  }, [dealId, user, state.messages, state.state]);

  const selectOption = useCallback((option: QuickOption) => {
    sendMessage(option.value);
  }, [sendMessage]);

  const startConversation = useCallback(() => {
    setState({
      messages: [],
      state: initialConversationalState,
      options: [],
      isLoading: false,
      isComplete: false,
      generatedDocument: null,
      disclaimer: null,
      error: null
    });
    sendMessage('start');
  }, [sendMessage]);

  const reset = useCallback(() => {
    setState({
      messages: [],
      state: initialConversationalState,
      options: [],
      isLoading: false,
      isComplete: false,
      generatedDocument: null,
      disclaimer: null,
      error: null
    });
  }, []);

  return {
    ...state,
    sendMessage,
    selectOption,
    startConversation,
    reset
  };
}

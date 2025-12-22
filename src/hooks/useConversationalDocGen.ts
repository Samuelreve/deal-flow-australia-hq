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

interface HistoryEntry {
  messages: ConversationalMessage[];
  state: ConversationalState;
  options: QuickOption[];
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
  history: HistoryEntry[];
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
    error: null,
    history: []
  });

  const sendMessage = useCallback(async (content: string) => {
    if (!user || !content.trim()) return;

    const userMessage: ConversationalMessage = { role: 'user', content };
    const newMessages = [...state.messages, userMessage];

    // Save current state to history before sending (for back button)
    const historyEntry: HistoryEntry = {
      messages: [...state.messages],
      state: { ...state.state },
      options: [...state.options]
    };

    setState(prev => ({
      ...prev,
      messages: newMessages,
      isLoading: true,
      error: null,
      history: [...prev.history, historyEntry]
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
              counterpartyName: deal?.counterparty_name,
              status: deal?.status,
              dealCategory: deal?.deal_category
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
        error: error.message,
        // Remove the history entry we just added since the request failed
        history: prev.history.slice(0, -1)
      }));
    }
  }, [dealId, user, state.messages, state.state, state.options, state.history]);

  const goBack = useCallback(() => {
    if (state.history.length === 0) return;

    // Get the previous state from history
    const previousEntry = state.history[state.history.length - 1];
    
    setState(prev => ({
      ...prev,
      messages: previousEntry.messages,
      state: previousEntry.state,
      options: previousEntry.options,
      history: prev.history.slice(0, -1),
      isLoading: false,
      error: null
    }));
  }, [state.history]);

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
      error: null,
      history: []
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
      error: null,
      history: []
    });
  }, []);

  return {
    ...state,
    sendMessage,
    selectOption,
    startConversation,
    reset,
    goBack,
    canGoBack: state.history.length > 0 && !state.isLoading && !state.isComplete
  };
}

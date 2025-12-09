import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { parseSSEStream } from '@/lib/streaming';

interface StreamingState {
  isStreaming: boolean;
  streamedContent: string;
  error: string | null;
}

interface UseStreamingAIOptions {
  onStreamStart?: () => void;
  onStreamEnd?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

export const useStreamingAI = (options: UseStreamingAIOptions = {}) => {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    streamedContent: '',
    error: null,
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const streamDealChat = useCallback(async (
    dealId: string,
    content: string,
    chatHistory: Array<{ role: string; content: string }> = []
  ): Promise<string> => {
    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setState({
      isStreaming: true,
      streamedContent: '',
      error: null,
    });
    
    options.onStreamStart?.();
    
    let fullContent = '';
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to use AI features');
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session');
      }
      
      const supabaseUrl = 'https://wntmgfuclbdrezxcvzmw.supabase.co';
      
      const response = await fetch(`${supabaseUrl}/functions/v1/copilot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          operation: 'deal_chat_query',
          dealId,
          userId: user.id,
          content,
          chatHistory,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} ${errorText}`);
      }
      
      await parseSSEStream(response, {
        onDelta: (text) => {
          fullContent += text;
          setState(prev => ({
            ...prev,
            streamedContent: fullContent,
          }));
        },
        onDone: () => {
          setState(prev => ({
            ...prev,
            isStreaming: false,
          }));
          options.onStreamEnd?.(fullContent);
        },
        onError: (error) => {
          setState(prev => ({
            ...prev,
            isStreaming: false,
            error: error.message,
          }));
          options.onError?.(error);
        },
      });
      
      return fullContent;
    } catch (error) {
      const err = error as Error;
      
      // Don't treat abort as error
      if (err.name === 'AbortError') {
        setState(prev => ({ ...prev, isStreaming: false }));
        return fullContent;
      }
      
      setState({
        isStreaming: false,
        streamedContent: fullContent,
        error: err.message,
      });
      options.onError?.(err);
      throw error;
    }
  }, [options]);

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(prev => ({ ...prev, isStreaming: false }));
  }, []);

  const resetStream = useCallback(() => {
    setState({
      isStreaming: false,
      streamedContent: '',
      error: null,
    });
  }, []);

  return {
    ...state,
    streamDealChat,
    cancelStream,
    resetStream,
  };
};

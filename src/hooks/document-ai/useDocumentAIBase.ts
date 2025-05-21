import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type AIOperation = 'explain_clause' | 'generate_template' | 'summarize_document' | 'explain_milestone' | 'suggest_next_action' | 'generate_milestones' | 'analyze_document';

export interface AIRequestOptions {
  content: string;
  documentId?: string;
  documentVersionId?: string;
  milestoneId?: string;
  context?: Record<string, any>;
}

export interface AIResponse {
  explanation?: string;
  template?: string;
  summary?: string;
  suggestion?: string;
  milestone?: {
    title: string;
    status: string;
  };
  milestones?: {
    name: string;
    description: string;
    order: number;
  }[];
  analysis?: {
    type: string;
    content: any;
  };
  disclaimer: string;
  success?: boolean;
  error?: string;
  isAmbiguous?: boolean;
  ambiguityExplanation?: string;
}

export interface UseDocumentAIBaseProps {
  dealId: string;
  documentId?: string;
}

/**
 * Base hook with common functionality for AI operations
 */
export const useDocumentAIBase = ({ dealId, documentId }: UseDocumentAIBaseProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIResponse | null>(null);

  /**
   * Process an AI request with the provided operation and options
   */
  const processAIRequest = async (
    operation: AIOperation, 
    options: AIRequestOptions
  ): Promise<AIResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to use AI features');
      }
      
      const { data, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation,
          dealId,
          documentId: options.documentId || documentId,
          documentVersionId: options.documentVersionId,
          milestoneId: options.milestoneId,
          content: options.content,
          userId: user.id,
          context: options.context
        }
      });

      if (error) {
        throw new Error(error.message || 'Error processing AI request');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to process AI request');
      }
      
      setResult(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: 'AI Assistant Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    result,
    processAIRequest,
    clearResult: () => setResult(null),
  };
};

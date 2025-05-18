
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

type AIOperation = 'explain_clause' | 'generate_template' | 'summarize_document';

interface UseDocumentAIProps {
  dealId: string;
}

interface AIRequestOptions {
  documentId?: string;
  content: string;
  context?: Record<string, any>;
}

interface AIResponse {
  explanation?: string;
  template?: string;
  summary?: string;
  disclaimer: string;
}

export const useDocumentAI = ({ dealId }: UseDocumentAIProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIResponse | null>(null);

  const processAIRequest = async (
    operation: AIOperation, 
    options: AIRequestOptions
  ) => {
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
          documentId: options.documentId,
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
  
  const explainClause = async (clause: string, context?: Record<string, any>) => {
    return processAIRequest('explain_clause', { content: clause, context });
  };
  
  const generateTemplate = async (requirements: string, context?: Record<string, any>) => {
    return processAIRequest('generate_template', { content: requirements, context });
  };
  
  const summarizeDocument = async (documentContent: string, documentId?: string) => {
    return processAIRequest('summarize_document', { content: documentContent, documentId });
  };
  
  return {
    loading,
    error,
    result,
    explainClause,
    generateTemplate,
    summarizeDocument,
    clearResult: () => setResult(null),
  };
};

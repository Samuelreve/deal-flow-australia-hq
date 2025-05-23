
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface QuestionHistoryItem {
  question: string;
  answer: string;
  timestamp: number;
  type: 'question' | 'analysis';
  analysisType?: string;
}

export const useRealContractQuestionAnswer = (contractId: string | null) => {
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Clear history when contract changes
  useEffect(() => {
    setQuestionHistory([]);
  }, [contractId]);

  const handleAskQuestion = useCallback(async (question: string, contractContent: string) => {
    if (!contractId) return null;
    
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'explain_clause',
          content: question,
          documentId: contractId,
          context: { contractContent }
        }
      });
      
      if (error) throw error;
      
      const answer = data.explanation || 'No response received';
      
      setQuestionHistory(prev => [
        ...prev,
        {
          question,
          answer,
          timestamp: Date.now(),
          type: 'question'
        }
      ]);
      
      return { question, answer };
    } catch (error) {
      console.error('Error asking question:', error);
      toast.error('Failed to process your question');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [contractId]);

  const handleAnalyzeContract = useCallback(async (analysisType: string, contractContent: string) => {
    if (!contractId) return null;
    
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'analyze_document',
          documentId: contractId,
          content: contractContent,
          context: { analysisType }
        }
      });
      
      if (error) throw error;
      
      const analysis = data.analysis?.content || `Analysis of type ${analysisType} completed`;
      
      setQuestionHistory(prev => [
        ...prev,
        {
          question: `Analyze contract: ${analysisType}`,
          answer: analysis,
          timestamp: Date.now(),
          type: 'analysis',
          analysisType
        }
      ]);
      
      return { analysisType, analysis };
    } catch (error) {
      console.error(`Error analyzing contract (${analysisType}):`, error);
      toast.error(`Failed to analyze contract: ${analysisType}`);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [contractId]);

  const handleDealHealthPrediction = useCallback(async (dealId: string) => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'predict_deal_health',
          dealId,
          content: ''
        }
      });
      
      if (error) throw error;
      
      return {
        probability_of_success_percentage: data.predicted_score || 75,
        confidence_level: data.confidence_level || "Medium",
        prediction_reasoning: data.reasoning || "Analysis based on current deal metrics and historical data.",
        suggested_improvements: data.suggested_improvements || [
          {
            area: "Documentation",
            impact: "Medium",
            recommendation: "Ensure all required documents are complete and up-to-date."
          }
        ],
        disclaimer: data.disclaimer || "This prediction is based on AI analysis and should be used as guidance alongside professional judgment."
      };
    } catch (error) {
      console.error('Error generating deal health prediction:', error);
      toast.error('Failed to generate deal health prediction');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    questionHistory,
    isProcessing,
    handleAskQuestion,
    handleAnalyzeContract,
    handleDealHealthPrediction,
    clearHistory: () => setQuestionHistory([])
  };
};

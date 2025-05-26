
import { useState } from 'react';
import { useDocumentAI } from '@/hooks/useDocumentAI';
import { toast } from 'sonner';

export interface QuestionHistoryItem {
  id: string;
  question: string;
  answer: string;
  timestamp: number;
  type: 'question' | 'analysis';
  isProcessing?: boolean;
}

export const useContractQuestionAnswer = () => {
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize AI hook with a demo deal ID
  const { explainClause, analyzeDocument } = useDocumentAI({ 
    dealId: 'demo-deal-id' 
  });

  const handleAskQuestion = async (question: string, contractText: string) => {
    if (!question.trim()) return;

    const questionId = `q-${Date.now()}`;
    
    // Add question to history immediately
    const newQuestion: QuestionHistoryItem = {
      id: questionId,
      question: question.trim(),
      answer: '',
      timestamp: Date.now(),
      type: 'question',
      isProcessing: true
    };

    setQuestionHistory(prev => [...prev, newQuestion]);
    setIsProcessing(true);
    setError(null);

    try {
      // Use the AI service to get an answer
      const result = await explainClause(question, { contractText });
      
      if (result && result.explanation) {
        // Update the question with the answer
        setQuestionHistory(prev => 
          prev.map(item => 
            item.id === questionId 
              ? { ...item, answer: result.explanation, isProcessing: false }
              : item
          )
        );
        
        toast.success('Question answered successfully');
      } else {
        throw new Error('No explanation received from AI service');
      }
    } catch (error: any) {
      console.error('Error asking question:', error);
      const errorMessage = error.message || 'Failed to get AI response';
      
      // Update question with error
      setQuestionHistory(prev => 
        prev.map(item => 
          item.id === questionId 
            ? { ...item, answer: `Error: ${errorMessage}`, isProcessing: false }
            : item
        )
      );
      
      setError(errorMessage);
      toast.error('Failed to get AI response', {
        description: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyzeContract = async (analysisType: string, contractText: string) => {
    if (!contractText) {
      toast.error('No contract text available for analysis');
      return;
    }

    const analysisId = `analysis-${Date.now()}`;
    
    // Add analysis to history
    const newAnalysis: QuestionHistoryItem = {
      id: analysisId,
      question: `Contract Analysis: ${analysisType}`,
      answer: '',
      timestamp: Date.now(),
      type: 'analysis',
      isProcessing: true
    };

    setQuestionHistory(prev => [...prev, newAnalysis]);
    setIsProcessing(true);
    setError(null);

    try {
      // Use the document analysis service
      const result = await analyzeDocument('demo-doc-id', 'demo-version-id', analysisType);
      
      if (result && result.analysis) {
        const analysisContent = typeof result.analysis.content === 'string' 
          ? result.analysis.content 
          : JSON.stringify(result.analysis.content, null, 2);
          
        setQuestionHistory(prev => 
          prev.map(item => 
            item.id === analysisId 
              ? { ...item, answer: analysisContent, isProcessing: false }
              : item
          )
        );
        
        toast.success(`${analysisType} analysis completed`);
      } else {
        throw new Error('No analysis received from AI service');
      }
    } catch (error: any) {
      console.error('Error analyzing contract:', error);
      const errorMessage = error.message || 'Failed to analyze contract';
      
      setQuestionHistory(prev => 
        prev.map(item => 
          item.id === analysisId 
            ? { ...item, answer: `Error: ${errorMessage}`, isProcessing: false }
            : item
        )
      );
      
      setError(errorMessage);
      toast.error('Contract analysis failed', {
        description: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearHistory = () => {
    setQuestionHistory([]);
    setError(null);
  };

  const setQuestionHistory = (newHistory: QuestionHistoryItem[] | ((prev: QuestionHistoryItem[]) => QuestionHistoryItem[])) => {
    if (typeof newHistory === 'function') {
      setQuestionHistory(prev => newHistory(prev));
    } else {
      setQuestionHistory(newHistory);
    }
  };

  return {
    questionHistory,
    isProcessing,
    error,
    handleAskQuestion,
    handleAnalyzeContract,
    clearHistory,
    setQuestionHistory
  };
};

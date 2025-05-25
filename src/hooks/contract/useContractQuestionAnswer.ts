
import { useState } from 'react';
import { toast } from 'sonner';

export interface QuestionHistoryItem {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  isProcessing?: boolean;
  type?: 'question' | 'analysis';
  analysisType?: string;
}

export const useContractQuestionAnswer = () => {
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAskQuestion = async (question: string, contractText?: string) => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    console.log('Sending question to AI:', question);

    const questionId = Date.now().toString();
    
    // Add processing item to history
    const processingItem: QuestionHistoryItem = {
      id: questionId,
      question,
      answer: '',
      timestamp: new Date(),
      isProcessing: true,
      type: 'question'
    };

    setQuestionHistory(prev => [...prev, processingItem]);
    setIsProcessing(true);

    try {
      // Use the correct Supabase edge function endpoint
      const response = await fetch('/functions/v1/public-ai-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestType: 'answer_question',
          userQuestion: question,
          fullDocumentText: contractText || 'Sample contract text for demo purposes'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Supabase function error:', errorData);
        throw new Error(errorData.message || 'Failed to get answer from AI');
      }

      const data = await response.json();
      
      if (data.success && data.answer) {
        // Update the processing item with the actual answer
        setQuestionHistory(prev => 
          prev.map(item => 
            item.id === questionId 
              ? { ...item, answer: data.answer, isProcessing: false }
              : item
          )
        );
        
        toast.success('Answer received!');
      } else {
        throw new Error('No answer received from AI');
      }
    } catch (error: any) {
      console.error('Error asking question:', error);
      
      // Remove the processing item on error
      setQuestionHistory(prev => prev.filter(item => item.id !== questionId));
      
      toast.error('Failed to get answer from AI');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyzeContract = async (analysisType: string, contractText?: string) => {
    const analysisQuestions: Record<string, string> = {
      'summarize_contract': 'Please provide a comprehensive summary of this contract.',
      'explain_clause': 'What are the key clauses and terms in this contract?',
      'identify_risks': 'What are the potential risks and red flags in this contract?',
      'obligations': 'What are the main obligations and responsibilities for each party?'
    };

    const question = analysisQuestions[analysisType] || `Please analyze this contract for: ${analysisType}`;
    
    const questionId = Date.now().toString();
    
    const processingItem: QuestionHistoryItem = {
      id: questionId,
      question,
      answer: '',
      timestamp: new Date(),
      isProcessing: true,
      type: 'analysis',
      analysisType
    };

    setQuestionHistory(prev => [...prev, processingItem]);
    setIsProcessing(true);

    try {
      const response = await fetch('/functions/v1/public-ai-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestType: 'answer_question',
          userQuestion: question,
          fullDocumentText: contractText || 'Sample contract text for demo purposes'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get analysis from AI');
      }

      const data = await response.json();
      
      if (data.success && data.answer) {
        setQuestionHistory(prev => 
          prev.map(item => 
            item.id === questionId 
              ? { ...item, answer: data.answer, isProcessing: false }
              : item
          )
        );
        
        toast.success('Analysis complete!');
      } else {
        throw new Error('No analysis received from AI');
      }
    } catch (error: any) {
      console.error('Error analyzing contract:', error);
      
      setQuestionHistory(prev => prev.filter(item => item.id !== questionId));
      
      toast.error('Failed to get analysis from AI');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    questionHistory,
    setQuestionHistory,
    isProcessing,
    handleAskQuestion,
    handleAnalyzeContract
  };
};

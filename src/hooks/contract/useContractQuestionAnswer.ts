
import { useState } from 'react';
import { toast } from 'sonner';

export interface QuestionHistoryItem {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  isProcessing?: boolean;
}

export const useContractQuestionAnswer = () => {
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAskQuestion = async (question: string, contractText: string) => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (!contractText) {
      toast.error('No contract content available');
      return;
    }

    console.log('Sending question to AI:', question);
    console.log('Contract content length:', contractText.length);

    const questionId = Date.now().toString();
    
    // Add processing item to history
    const processingItem: QuestionHistoryItem = {
      id: questionId,
      question,
      answer: '',
      timestamp: new Date(),
      isProcessing: true
    };

    setQuestionHistory(prev => [...prev, processingItem]);
    setIsProcessing(true);

    try {
      // Use the public AI analyzer endpoint for Q&A
      const response = await fetch('/api/public-ai-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestType: 'answer_question',
          userQuestion: question,
          fullDocumentText: contractText
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

  const handleAnalyzeContract = async (analysisType: string, contractText: string) => {
    // For now, convert analysis requests to questions
    const analysisQuestions: Record<string, string> = {
      'summarize_contract': 'Please provide a comprehensive summary of this contract.',
      'explain_clause': 'What are the key clauses and terms in this contract?',
      'identify_risks': 'What are the potential risks and red flags in this contract?',
      'obligations': 'What are the main obligations and responsibilities for each party?'
    };

    const question = analysisQuestions[analysisType] || `Please analyze this contract for: ${analysisType}`;
    return handleAskQuestion(question, contractText);
  };

  return {
    questionHistory,
    isProcessing,
    handleAskQuestion,
    handleAnalyzeContract
  };
};

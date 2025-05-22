
import { useState, useCallback } from 'react';

/**
 * Hook for question answering functionality
 */
export const useQuestionAnswering = () => {
  // Q&A state
  const [questionHistory, setQuestionHistory] = useState<Array<{question: string, answer: string}>>([]);

  // Function to handle asking questions about the contract
  const handleAskQuestion = useCallback(async (question: string): Promise<{answer: string; sources?: string[]}> => {
    // In a real app, this would call an AI service with the question and contract text
    // For this demo, we'll simulate different responses based on keywords
    
    // Add a short delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let answer = '';
    const keywords = question.toLowerCase();
    
    // Match common questions with prepared answers
    if (keywords.includes('duration') || keywords.includes('term') || keywords.includes('how long')) {
      answer = "The agreement is effective for 3 years from the date of signing, as stated in Section 3 of the contract.";
    } 
    else if (keywords.includes('termination') || keywords.includes('cancel') || keywords.includes('end')) {
      answer = "According to Section 4, either party may terminate this agreement with thirty (30) days written notice to the other party.";
    }
    else if (keywords.includes('confidential') || keywords.includes('information') || keywords.includes('protect')) {
      answer = "The receiving party must hold and maintain the confidential information in strictest confidence for the sole and exclusive benefit of the disclosing party, as specified in Section 2.";
    }
    else if (keywords.includes('governing') || keywords.includes('law') || keywords.includes('jurisdiction')) {
      answer = "The agreement is governed by the laws of the State specified in Section 5 of the contract.";
    }
    else if (keywords.includes('parties') || keywords.includes('who')) {
      answer = "The parties in this agreement are Company A (the Disclosing Party) and Company B (the Receiving Party).";
    }
    else {
      // Generic response for questions we don't have a specific answer for
      answer = "Based on my analysis of the contract, I don't have specific information about this question. Please review the full contract text or consult a legal professional for more detailed information.";
    }
    
    // Add to question history
    setQuestionHistory(prev => [...prev, { question, answer }]);
    
    return { 
      answer,
      sources: ['Section 1-5, Non-Disclosure Agreement'] 
    };
  }, []);

  return {
    questionHistory,
    handleAskQuestion
  };
};

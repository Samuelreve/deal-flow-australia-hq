
import { useState, useCallback } from 'react';

/**
 * Hook for question answering functionality
 */
export const useQuestionAnswering = () => {
  // Q&A state
  const [questionHistory, setQuestionHistory] = useState<Array<{question: string, answer: string}>>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to handle asking questions about the contract
  const handleAskQuestion = useCallback(async (question: string): Promise<{answer: string; sources?: string[]}> => {
    // Set processing state
    setIsProcessing(true);
    
    try {
      // In a real app, this would call an AI service with the question and contract text
      // For this demo, we'll simulate different responses based on keywords
      
      // Add a short delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let answer = '';
      let sources: string[] = [];
      const keywords = question.toLowerCase();
      
      // Match common questions with prepared answers
      if (keywords.includes('duration') || keywords.includes('term') || keywords.includes('how long')) {
        answer = "The agreement is effective for 3 years from the date of signing, as stated in Section 3 of the contract.";
        sources = ['Section 3: Term', 'Section 8.2: Duration and Renewal'];
      } 
      else if (keywords.includes('termination') || keywords.includes('cancel') || keywords.includes('end')) {
        answer = "According to Section 4, either party may terminate this agreement with thirty (30) days written notice to the other party. Additionally, the contract may be terminated immediately for material breach by providing written notice to the breaching party.";
        sources = ['Section 4: Termination', 'Section 4.2: Effects of Termination'];
      }
      else if (keywords.includes('confidential') || keywords.includes('information') || keywords.includes('protect')) {
        answer = "The receiving party must hold and maintain the confidential information in strictest confidence for the sole and exclusive benefit of the disclosing party, as specified in Section 2. This includes implementing reasonable security measures to protect such information, and restricting access to employees who need to know such information for the purposes outlined in this agreement.";
        sources = ['Section 2: Confidentiality Obligations', 'Section 2.3: Security Measures'];
      }
      else if (keywords.includes('governing') || keywords.includes('law') || keywords.includes('jurisdiction')) {
        answer = "The agreement is governed by the laws of the State specified in Section 5 of the contract. Any disputes arising from this agreement shall be resolved in the courts of that jurisdiction, without regard to conflict of law principles.";
        sources = ['Section 5: Governing Law', 'Section 5.2: Dispute Resolution'];
      }
      else if (keywords.includes('parties') || keywords.includes('who')) {
        answer = "The parties in this agreement are Company A (the Disclosing Party) and Company B (the Receiving Party). Company A is located at 123 Business Ave, City, State, while Company B is located at 456 Corporate Blvd, Town, State.";
        sources = ['Preamble', 'Section 1.1: Party Definitions'];
      } 
      else if (keywords.includes('penalty') || keywords.includes('breach') || keywords.includes('violation')) {
        answer = "In case of breach, the non-breaching party may seek injunctive relief in addition to any other remedies available by law. The breaching party may be liable for damages resulting from unauthorized disclosure of confidential information, including reasonable attorney fees.";
        sources = ['Section 6: Remedies', 'Section 6.2: Injunctive Relief'];
      }
      else if (keywords.includes('modify') || keywords.includes('amendment') || keywords.includes('change')) {
        answer = "This agreement may only be modified by a written document signed by authorized representatives of both parties. Oral modifications are not valid or binding on either party.";
        sources = ['Section 7: Amendments', 'Section 9: Entire Agreement'];
      }
      else if (keywords.includes('payment') || keywords.includes('compensation') || keywords.includes('fee')) {
        answer = "The contract does not specify any payment terms or compensation structure. This appears to be a non-commercial confidentiality agreement without monetary exchange.";
        sources = ['Full Document Analysis'];
      }
      else if (keywords.includes('intellectual property') || keywords.includes('ip') || keywords.includes('copyright') || keywords.includes('patent')) {
        answer = "While the agreement primarily addresses confidentiality, Section 8 clarifies that nothing in this agreement transfers ownership of intellectual property rights between the parties. Each party retains all rights to their respective intellectual property disclosed under this agreement.";
        sources = ['Section 8: Intellectual Property Rights', 'Section 8.1: Ownership'];
      }
      else if (keywords.includes('purpose') || keywords.includes('goal') || keywords.includes('objective')) {
        answer = "The purpose of this agreement is to protect confidential information shared between the parties for business collaboration purposes, as stated in the recitals of the contract.";
        sources = ['Recitals', 'Section 1.2: Purpose'];
      }
      else {
        // Generic response for questions we don't have a specific answer for
        answer = "Based on my analysis of the contract, I don't have specific information about this question. Please review the full contract text or consult a legal professional for more detailed information. The contract primarily covers confidentiality obligations, term, termination, governing law, and remedies for breach.";
        sources = ['Full Document Analysis'];
      }
      
      // Add to question history
      setQuestionHistory(prev => [...prev, { question, answer }]);
      
      return { 
        answer,
        sources
      };
    } catch (error) {
      console.error("Error processing question:", error);
      return {
        answer: "Sorry, there was an error processing your question. Please try again.",
        sources: []
      };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    questionHistory,
    handleAskQuestion,
    isProcessing
  };
};


import { useState, useCallback } from 'react';
import { QuestionHistoryItem } from '@/types/contract';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const useContractQuestionAnswer = () => {
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAskQuestion = useCallback(async (question: string, contractText: string) => {
    if (!question || !contractText) {
      const errorMsg = !question ? "Question is required" : "No contract text available";
      toast.error(errorMsg);
      setError(errorMsg);
      return { answer: errorMsg };
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create a placeholder for the new question
      const newQuestion: QuestionHistoryItem = {
        id: uuidv4(),
        question,
        answer: { answer: "Processing..." },
        timestamp: new Date(),
        isProcessing: true
      };

      // Add to history
      setQuestionHistory(prev => [newQuestion, ...prev]);

      // In a real implementation, this would call an API
      // For demo, simulate a delay and generate a response
      const response = await simulateQuestionAnswering(question, contractText);

      // Update the question history with the response
      setQuestionHistory(prev => 
        prev.map(q => 
          q.id === newQuestion.id 
            ? { ...q, answer: response, isProcessing: false } 
            : q
        )
      );

      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to process question";
      console.error("Question answering error:", err);
      
      setQuestionHistory(prev => 
        prev.map(q => 
          q.isProcessing 
            ? { ...q, answer: { answer: `Error: ${errorMsg}` }, isProcessing: false } 
            : q
        )
      );
      
      setError(errorMsg);
      toast.error(`Error: ${errorMsg}`);
      return { answer: `Error: ${errorMsg}` };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Simulate AI question answering (for demo/mock purposes)
  const simulateQuestionAnswering = async (question: string, contractText: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple pattern matching for demo purposes
    const questionLower = question.toLowerCase();
    
    // Basic pattern matching for common contract questions
    if (questionLower.includes("effective date") || questionLower.includes("when does")) {
      return {
        answer: "The effective date of this contract is June 1, 2023, as stated in the first paragraph.",
        sources: ["Paragraph 1"]
      };
    } else if (questionLower.includes("governing law") || questionLower.includes("jurisdiction")) {
      return {
        answer: "This Agreement is governed by the laws of the State of New York, as specified in Section 5.",
        sources: ["Section 5"]
      };
    } else if (questionLower.includes("term") || questionLower.includes("duration") || questionLower.includes("how long")) {
      return {
        answer: "The Agreement remains in effect for 3 years from the Effective Date, with confidentiality obligations surviving for 5 years after termination.",
        sources: ["Section 3"]
      };
    } else if (questionLower.includes("terminate") || questionLower.includes("ending")) {
      return {
        answer: "Either party may terminate this Agreement upon thirty (30) days prior written notice to the other party.",
        sources: ["Section 4"]
      };
    } else if (questionLower.includes("confidential") || questionLower.includes("disclosure")) {
      return {
        answer: "Confidential Information means any information disclosed that is designated as 'Confidential' or 'Proprietary', or which a reasonable person would understand to be confidential.",
        sources: ["Section 2"]
      };
    } else {
      // Generic response with extracted context from the contract
      return {
        answer: `Based on the contract analysis, your question about "${question}" relates to general terms of the mutual NDA between Company A and Company B. The agreement provides protections for confidential information exchanged between the parties for a business opportunity.`,
        sources: ["General Context"]
      };
    }
  };

  const handleAnalyzeContract = useCallback(async (analysisType: string, contractText: string) => {
    if (!contractText) {
      const errorMsg = "No contract text available to analyze";
      toast.error(errorMsg);
      setError(errorMsg);
      return { answer: errorMsg };
    }

    setIsProcessing(true);
    setError(null);

    try {
      // In a real implementation, this would call an API
      // For demo, simulate a delay and return a response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let response;
      switch (analysisType) {
        case "summary":
          response = {
            answer: "This is a comprehensive Mutual Non-Disclosure Agreement between Company A and Company B. The agreement has a 3-year term with confidentiality obligations surviving for 5 years after termination. It includes standard provisions for protecting confidential information exchanged during business discussions.",
            sources: ["Full Document"]
          };
          break;
        case "risks":
          response = {
            answer: "Key risks identified:\n• Broad definition of confidential information could lead to disputes\n• 5-year post-termination confidentiality period may be excessive\n• Limited remedies specified for breach\n• No specific carve-outs for independently developed information",
            sources: ["Section 2", "Section 3", "Section 6"]
          };
          break;
        case "keyTerms":
          response = {
            answer: "Key terms and clauses:\n• Effective Date: June 1, 2023\n• Term: 3 years with 5-year survival for confidentiality\n• Governing Law: State of New York\n• Termination: 30 days written notice\n• Remedies: Injunctive relief available\n• No IP rights granted",
            sources: ["Section 3", "Section 5", "Section 8"]
          };
          break;
        case "suggestions":
          response = {
            answer: "Recommendations for improvement:\n• Add specific carve-outs for publicly available information\n• Include return/destruction of confidential information clause\n• Consider reducing post-termination confidentiality period\n• Add dispute resolution mechanism\n• Clarify what constitutes 'reasonable person' standard",
            sources: ["Section 2", "Section 3"]
          };
          break;
        default:
          response = {
            answer: "Analysis complete",
            sources: []
          };
      }
      
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to analyze contract";
      console.error("Contract analysis error:", err);
      setError(errorMsg);
      toast.error(`Error: ${errorMsg}`);
      return { answer: `Error: ${errorMsg}` };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    questionHistory,
    isProcessing,
    error,
    handleAskQuestion,
    handleAnalyzeContract,
    // Expose this for testing and demo purposes
    setQuestionHistory
  };
};

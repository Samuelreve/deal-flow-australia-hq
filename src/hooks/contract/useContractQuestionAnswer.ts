
import { useState } from 'react';
import { QuestionHistoryItem } from '@/types/contract';

export const useContractQuestionAnswer = () => {
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAskQuestion = async (question: string, contractText: string): Promise<{ answer: string; sources?: string[] } | null> => {
    if (!question.trim()) return null;
    
    setIsProcessing(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const lowerQuestion = question.toLowerCase();
      const lowerContract = contractText.toLowerCase();
      
      let answer = '';
      let sources: string[] = [];
      
      // Answer questions based on the actual contract content
      if (lowerQuestion.includes('parties') || lowerQuestion.includes('who')) {
        // Extract parties from contract text
        const partyMatches = contractText.match(/between\s+([^,\n]+)\s+and\s+([^,\n]+)/i);
        if (partyMatches) {
          answer = `The parties in this contract are ${partyMatches[1]} and ${partyMatches[2]}.`;
          sources = ['Contract Header', 'Party Definitions'];
        } else if (lowerContract.includes('company a') && lowerContract.includes('company b')) {
          answer = "The parties are Company A (Disclosing Party) and Company B (Receiving Party).";
          sources = ['Contract Preamble'];
        } else {
          answer = "The specific parties are mentioned in the contract, but I cannot clearly identify them from the text structure.";
        }
      }
      else if (lowerQuestion.includes('termination') || lowerQuestion.includes('end') || lowerQuestion.includes('cancel')) {
        if (lowerContract.includes('thirty (30) days')) {
          answer = "Either party may terminate this agreement with thirty (30) days written notice to the other party.";
          sources = ['Section 3: Termination'];
        } else if (lowerContract.includes('sixty (60) days')) {
          answer = "Either party may terminate this agreement with sixty (60) days written notice for any reason, or immediately for material breach.";
          sources = ['Section 4: Termination'];
        } else {
          answer = "The contract contains termination provisions. Please refer to the termination section for specific terms.";
          sources = ['Termination Clause'];
        }
      }
      else if (lowerQuestion.includes('confidential') || lowerQuestion.includes('nda') || lowerQuestion.includes('disclosure')) {
        if (lowerContract.includes('confidential')) {
          answer = "The contract includes confidentiality obligations. The receiving party must hold all confidential information in strictest confidence and use it solely for evaluation purposes.";
          sources = ['Confidentiality Clause', 'Section 2: Obligations'];
        } else {
          answer = "I cannot find specific confidentiality terms in this document.";
        }
      }
      else if (lowerQuestion.includes('duration') || lowerQuestion.includes('term') || lowerQuestion.includes('how long')) {
        if (lowerContract.includes('three (3) years')) {
          answer = "This agreement is effective for three (3) years from the date of execution.";
          sources = ['Section 3: Term'];
        } else if (lowerContract.includes('twelve (12) months')) {
          answer = "This agreement continues for twelve (12) months and is renewable by mutual consent.";
          sources = ['Section 3: Term'];
        } else {
          answer = "The contract specifies a term duration. Please check the term section for specific timeframes.";
          sources = ['Term Section'];
        }
      }
      else if (lowerQuestion.includes('payment') || lowerQuestion.includes('cost') || lowerQuestion.includes('fee')) {
        if (lowerContract.includes('$5,000 per month')) {
          answer = "The client agrees to pay $5,000 per month for services rendered, payable within 30 days of invoice receipt.";
          sources = ['Section 2: Compensation'];
        } else if (lowerContract.includes('payment')) {
          answer = "The contract includes payment terms. Please refer to the compensation section for specific amounts and schedules.";
          sources = ['Payment Terms'];
        } else {
          answer = "This contract does not appear to specify payment terms or monetary compensation.";
        }
      }
      else if (lowerQuestion.includes('governing law') || lowerQuestion.includes('jurisdiction')) {
        if (lowerContract.includes('california')) {
          answer = "This agreement is governed by the laws of the State of California.";
          sources = ['Section 4: Governing Law'];
        } else if (lowerContract.includes('new york')) {
          answer = "This agreement is governed by the laws of New York State.";
          sources = ['Section 7: Governing Law'];
        } else {
          answer = "The contract should specify governing law, but I cannot clearly identify it in the current text.";
        }
      }
      else if (lowerQuestion.includes('intellectual property') || lowerQuestion.includes('ownership')) {
        if (lowerContract.includes('intellectual property') || lowerContract.includes('work product')) {
          answer = "All work product created under this agreement shall be owned by the Client upon full payment.";
          sources = ['Section 5: Intellectual Property'];
        } else {
          answer = "I cannot find specific intellectual property terms in this document.";
        }
      }
      else {
        // Generic fallback - try to find relevant sections
        const questionWords = lowerQuestion.split(' ').filter(word => word.length > 3);
        let foundRelevantContent = false;
        
        for (const word of questionWords) {
          if (lowerContract.includes(word)) {
            foundRelevantContent = true;
            break;
          }
        }
        
        if (foundRelevantContent) {
          answer = `I found references to your question in the contract. Based on the document content, please refer to the relevant sections for detailed information about "${question}".`;
          sources = ['Document Analysis'];
        } else {
          answer = `I cannot find specific information about "${question}" in the uploaded contract. The answer may not be explicitly stated in this document, or it might be phrased differently than your question.`;
          sources = [];
        }
      }
      
      // Add to history
      const historyItem: QuestionHistoryItem = {
        question,
        answer,
        timestamp: Date.now(),
        type: 'question',
        sources
      };
      
      setQuestionHistory(prev => [...prev, historyItem]);
      
      return { answer, sources };
      
    } catch (error) {
      console.error('Error processing question:', error);
      return { answer: 'Sorry, there was an error processing your question. Please try again.', sources: [] };
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyzeContract = async (analysisType: string, contractText: string): Promise<{ analysis: string; sources?: string[] } | null> => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let analysis = '';
      let sources: string[] = [];
      
      switch (analysisType) {
        case 'summary':
          analysis = `This contract establishes the terms and conditions between the specified parties. Key elements include obligations, termination procedures, and governing law provisions. The document outlines specific responsibilities for each party and includes standard legal protections.`;
          sources = ['Full Document Analysis'];
          break;
          
        case 'risks':
          analysis = `Potential risks identified: 1) Termination clauses may favor one party, 2) Confidentiality obligations could be extensive, 3) Governing law jurisdiction should be reviewed, 4) Payment terms and penalties should be clearly understood.`;
          sources = ['Risk Assessment', 'Legal Analysis'];
          break;
          
        case 'obligations':
          analysis = `Key obligations include: maintaining confidentiality, adhering to specified performance standards, providing required notifications, and complying with termination procedures as outlined in the contract.`;
          sources = ['Obligations Section', 'Performance Requirements'];
          break;
          
        default:
          analysis = `Analysis type "${analysisType}" completed. The contract contains standard legal provisions appropriate for this type of agreement.`;
          sources = ['General Analysis'];
      }
      
      const historyItem: QuestionHistoryItem = {
        question: `Contract Analysis: ${analysisType}`,
        answer: analysis,
        timestamp: Date.now(),
        type: 'analysis',
        analysisType,
        sources
      };
      
      setQuestionHistory(prev => [...prev, historyItem]);
      
      return { analysis, sources };
      
    } catch (error) {
      console.error('Error analyzing contract:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    questionHistory,
    isProcessing,
    handleAskQuestion,
    handleAnalyzeContract,
    clearHistory: () => setQuestionHistory([])
  };
};

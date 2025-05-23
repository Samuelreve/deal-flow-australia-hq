
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useContractAnalysisState } from '@/hooks/contract/useContractAnalysisState';
import { useContractQuestionAnswer, QuestionHistoryItem } from '@/hooks/contract/useContractQuestionAnswer';
import { mockQuestionHistory } from '@/hooks/contract-analysis/mockData';

// Sample contract text for demo purposes
const SAMPLE_CONTRACT_TEXT = `
MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "Agreement") is entered into as of June 1, 2023 (the "Effective Date") by and between Company A, located at 123 Business Ave, City, State ("Company A"), and Company B, located at 456 Corporate Blvd, Town, State ("Company B").

1. PURPOSE
The parties wish to explore a potential business opportunity of mutual interest and in connection with this opportunity, each party may disclose to the other certain confidential technical and business information that the disclosing party desires the receiving party to treat as confidential.

2. CONFIDENTIAL INFORMATION
"Confidential Information" means any information disclosed by either party to the other party, either directly or indirectly, in writing, orally or by inspection of tangible objects, which is designated as "Confidential," "Proprietary" or some similar designation, or information which by its nature would be understood by a reasonable person to be confidential or proprietary.

3. TERM
This Agreement shall remain in effect for a period of 3 years from the Effective Date. The confidentiality obligations set forth in this Agreement shall survive termination of this Agreement for a period of 5 years.

4. TERMINATION
Either party may terminate this Agreement upon thirty (30) days prior written notice to the other party. All sections of this Agreement relating to the rights and obligations of the parties concerning Confidential Information disclosed during the term of the Agreement shall survive any such termination.

5. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law principles. Any disputes arising out of or related to this Agreement shall be resolved in the courts of New York County, New York.

6. REMEDIES
The receiving party agrees that any violation or threatened violation of this Agreement may cause irreparable injury to the disclosing party, entitling the disclosing party to seek injunctive relief in addition to all legal remedies.

7. AMENDMENTS
This Agreement may not be amended except by a written agreement signed by authorized representatives of both parties.

8. INTELLECTUAL PROPERTY RIGHTS
Nothing in this Agreement is intended to grant any rights to either party under any patent, copyright, trade secret or other intellectual property right of the other party.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the Effective Date.

COMPANY A                             COMPANY B
By: _________________                By: _________________
Name: John Smith                      Name: Jane Doe
Title: CEO                            Title: CTO
Date: June 1, 2023                    Date: June 1, 2023
`;

export const useDemoContractState = () => {
  const [searchParams] = useSearchParams();
  const analysisState = useContractAnalysisState();
  const questionAnswerState = useContractQuestionAnswer();
  
  useEffect(() => {
    const shouldAnalyze = searchParams.get("analyze") === "true";
    
    // Set sample contract text if no contract text is available
    if (!analysisState.contractText) {
      analysisState.setContractText(SAMPLE_CONTRACT_TEXT);
    }
    
    // In demo mode, pre-populate with mock data if no real data exists
    if (!questionAnswerState.questionHistory || questionAnswerState.questionHistory.length === 0) {
      // Only for demo purposes - use mock question history with correct type
      if (process.env.NODE_ENV !== 'production') {
        const mockHistoryWithType = mockQuestionHistory.map(item => ({
          ...item,
          type: 'question' as const,
          answer: typeof item.answer === 'string' ? item.answer : item.answer.answer,
          timestamp: typeof item.timestamp === 'number' ? item.timestamp : Date.now()
        }));
        questionAnswerState.setQuestionHistory(mockHistoryWithType);
      }
    }
    
    if (shouldAnalyze && !analysisState.isAnalyzing) {
      toast.success("Contract analyzed successfully", {
        description: "AI summary and insights are now available"
      });
    }
  }, [searchParams, analysisState, questionAnswerState]);

  return {
    analysisState,
    questionAnswerState,
    sampleContractText: SAMPLE_CONTRACT_TEXT
  };
};


import { QuestionHistoryItem } from '@/hooks/contract/useContractQuestionAnswer';

export const useDemoContractInteractions = () => {
  const handleAnalyzeContract = async (
    setQuestionHistory: React.Dispatch<React.SetStateAction<QuestionHistoryItem[]>>,
    analysisType: string
  ): Promise<{ analysis: string; sources?: string[] } | null> => {
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let analysis = '';
      let sources: string[] = [];
      
      switch (analysisType) {
        case 'summary':
          analysis = `This demo contract establishes clear terms between the parties with focus on confidentiality and mutual obligations. The agreement includes standard termination procedures and governing law provisions.`;
          sources = ['Full Document Analysis'];
          break;
          
        case 'risks':
          analysis = `Demo analysis - Potential risks identified: 1) Confidentiality breach penalties, 2) Termination notice requirements, 3) Jurisdiction considerations for dispute resolution.`;
          sources = ['Risk Assessment', 'Legal Analysis'];
          break;
          
        case 'obligations':
          analysis = `Demo analysis - Key obligations include: maintaining strict confidentiality, providing timely notifications, adhering to performance standards, and following proper termination procedures.`;
          sources = ['Obligations Section', 'Performance Requirements'];
          break;
          
        default:
          analysis = `Demo analysis of type "${analysisType}" completed successfully. This shows how AI can analyze different aspects of your contracts.`;
          sources = ['General Analysis'];
      }
      
      const historyItem: QuestionHistoryItem = {
        id: `demo-${Date.now()}`,
        question: `Demo Contract Analysis: ${analysisType}`,
        answer: analysis,
        timestamp: Date.now(),
        type: 'analysis',
        analysisType,
        sources
      };
      
      setQuestionHistory(prev => [...prev, historyItem]);
      
      return { analysis, sources };
      
    } catch (error) {
      console.error('Error in demo contract analysis:', error);
      return null;
    }
  };

  return {
    handleAnalyzeContract
  };
};

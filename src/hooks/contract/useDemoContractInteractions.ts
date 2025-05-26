
import { useState } from 'react';
import { toast } from 'sonner';
import { QuestionHistoryItem } from '@/hooks/contract/useContractQuestionAnswer';

export const useDemoContractInteractions = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleAnalyzeContract = async (
    setQuestionHistory: (updater: (prev: QuestionHistoryItem[]) => QuestionHistoryItem[]) => void,
    analysisType: string
  ) => {
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

    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysisResult = generateAnalysisResult(analysisType);
      
      setQuestionHistory(prev => 
        prev.map(item => 
          item.id === analysisId 
            ? { ...item, answer: analysisResult, isProcessing: false }
            : item
        )
      );
      
      toast.success(`${analysisType} analysis completed`);
    } catch (error: any) {
      setQuestionHistory(prev => 
        prev.map(item => 
          item.id === analysisId 
            ? { ...item, answer: `Error: ${error.message}`, isProcessing: false }
            : item
        )
      );
      
      toast.error('Analysis failed');
    }
  };

  const generateAnalysisResult = (analysisType: string): string => {
    switch (analysisType) {
      case 'Risk Analysis':
        return 'Risk Assessment:\n\n• High Risk: Payment terms lack specific penalties for late payment\n• Medium Risk: Termination clause could be more specific about notice requirements\n• Low Risk: Confidentiality provisions are well-defined\n\nRecommendations:\n1. Add late payment penalties\n2. Clarify termination notice requirements\n3. Consider adding dispute resolution mechanisms';
      
      case 'Key Terms':
        return 'Key Contract Terms:\n\n• Contract Duration: 3 years with automatic renewal\n• Payment Terms: Net 30 days\n• Termination: 30 days written notice\n• Governing Law: State jurisdiction specified\n• Confidentiality: Mutual non-disclosure obligations\n• Intellectual Property: Rights remain with original owners';
      
      case 'Obligations':
        return 'Party Obligations:\n\nCompany A (Disclosing Party):\n• Provide accurate confidential information\n• Mark confidential materials appropriately\n• Notify of any changes to information\n\nCompany B (Receiving Party):\n• Maintain strict confidentiality\n• Implement security measures\n• Return or destroy information upon termination\n• Restrict access to need-to-know basis';
      
      default:
        return `${analysisType} analysis completed. This is a comprehensive review of the contract focusing on ${analysisType.toLowerCase()} aspects. The analysis identifies key areas of concern and provides actionable recommendations for improvement.`;
    }
  };

  return {
    isExporting,
    handleAnalyzeContract
  };
};


import { QuestionHistoryItem } from '@/hooks/contract/useContractQuestionAnswer';
import { toast } from 'sonner';

export const useContractInteractions = () => {
  // Add a mock analyze contract function
  const handleAnalyzeContract = async (
    setQuestionHistory: React.Dispatch<React.SetStateAction<QuestionHistoryItem[]>>,
    analysisType: string
  ) => {
    const answer = `This is a simulated ${analysisType} analysis of the contract.`;
    const newItem: QuestionHistoryItem = {
      question: `Analyze contract: ${analysisType}`,
      answer,
      timestamp: Date.now(),
      type: 'analysis',
      analysisType
    };
    
    setQuestionHistory(prev => [...prev, newItem]);
    return { analysisType, analysis: answer };
  };

  const exportHighlightsToCSV = (documentHighlights: any[]) => {
    if (documentHighlights.length === 0) {
      toast.error('No highlights to export');
      return;
    }
    
    try {
      const headers = ['Text', 'Category', 'Note', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...documentHighlights.map(highlight => {
          return [
            `"${highlight.text.replace(/"/g, '""')}"`,
            highlight.category || '',
            `"${(highlight.note || '').replace(/"/g, '""')}"`,
            new Date(highlight.createdAt).toLocaleString()
          ].join(',');
        })
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `contract-highlights-${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Highlights exported successfully');
    } catch (error) {
      console.error('Error exporting highlights:', error);
      toast.error('Failed to export highlights');
    }
  };

  return {
    handleAnalyzeContract,
    exportHighlightsToCSV
  };
};

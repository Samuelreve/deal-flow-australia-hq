
import { useCallback } from 'react';
import { toast } from 'sonner';
import { DocumentHighlight } from '@/types/contract';

export const useContractInteractions = () => {
  
  const exportHighlightsToCSV = useCallback((highlights: DocumentHighlight[]) => {
    if (highlights.length === 0) {
      toast.error('No highlights to export');
      return;
    }
    
    try {
      // Create CSV content
      const headers = ['Text', 'Category', 'Note', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...highlights.map(highlight => {
          return [
            `"${highlight.text.replace(/"/g, '""')}"`,
            highlight.category,
            `"${(highlight.note || '').replace(/"/g, '""')}"`,
            new Date(highlight.createdAt).toLocaleString()
          ].join(',');
        })
      ].join('\n');
      
      // Create download link
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
  }, []);

  const handleAnalyzeContract = useCallback(async (
    setQuestionHistory: (updater: (prev: any[]) => any[]) => void,
    analysisType: string
  ) => {
    // This will be called by the parent component with the actual analysis logic
    // The parent component will handle the AI analysis call
    return Promise.resolve();
  }, []);

  return {
    exportHighlightsToCSV,
    handleAnalyzeContract
  };
};

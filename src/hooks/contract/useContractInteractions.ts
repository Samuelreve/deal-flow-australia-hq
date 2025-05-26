
import { useState } from 'react';
import { toast } from 'sonner';
import { DocumentHighlight } from '@/types/contract';

export const useContractInteractions = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportHighlightsToCSV = async (highlights: DocumentHighlight[]) => {
    if (!highlights || highlights.length === 0) {
      toast.error('No highlights to export');
      return;
    }

    setIsExporting(true);

    try {
      // Create CSV content
      const headers = ['Text', 'Category', 'Note', 'Created At', 'Start Index', 'End Index'];
      const csvRows = [
        headers.join(','),
        ...highlights.map(highlight => [
          `"${highlight.text.replace(/"/g, '""')}"`,
          highlight.category || 'general',
          `"${(highlight.note || '').replace(/"/g, '""')}"`,
          new Date(highlight.createdAt).toLocaleString(),
          highlight.startIndex.toString(),
          highlight.endIndex.toString()
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `contract-highlights-${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      toast.success('Highlights exported successfully', {
        description: `Exported ${highlights.length} highlights to CSV`
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Export failed', {
        description: error.message || 'Failed to export highlights'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportContractAnalysis = async (analysis: any, contractName: string) => {
    setIsExporting(true);

    try {
      const analysisText = typeof analysis === 'string' 
        ? analysis 
        : JSON.stringify(analysis, null, 2);

      const content = `Contract Analysis Report
Generated: ${new Date().toLocaleString()}
Document: ${contractName}

${analysisText}`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `contract-analysis-${Date.now()}.txt`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      toast.success('Analysis exported successfully');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Export failed', {
        description: error.message || 'Failed to export analysis'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportHighlightsToCSV,
    exportContractAnalysis
  };
};

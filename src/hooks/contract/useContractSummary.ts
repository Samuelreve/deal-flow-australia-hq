
import { useState, useEffect } from 'react';

export const useContractSummary = (contractText: string, documentId?: string) => {
  const [documentSummary, setDocumentSummary] = useState<any>(null);

  console.log('useContractSummary:', { contractTextLength: contractText.length, documentId });

  useEffect(() => {
    if (contractText && documentId) {
      console.log('Setting up document summary for:', documentId);
      // Create a basic summary when we have contract text
      setDocumentSummary({
        title: 'Document Analysis Complete',
        category: 'CONTRACT',
        message: 'Document processed and ready for analysis',
        keyPoints: [
          `Document length: ${contractText.length} characters`,
          'Text extracted successfully',
          'Ready for AI-powered analysis',
          'Can ask questions about contract content'
        ],
        analysisDate: new Date().toISOString()
      });
    } else {
      setDocumentSummary(null);
    }
  }, [contractText, documentId]);

  return {
    documentSummary
  };
};

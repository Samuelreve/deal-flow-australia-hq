
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DocumentSummary {
  category: 'CONTRACT' | 'FINANCIAL' | 'IRRELEVANT';
  title: string;
  message: string;
  confidence?: number;
}

export const useContractSummary = (contractText: string, contractId?: string) => {
  const [documentSummary, setDocumentSummary] = useState<DocumentSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contractText || contractText.trim().length === 0) {
      setDocumentSummary(null);
      return;
    }

    const analyzeDocument = async () => {
      setLoading(true);
      
      try {
        // Use AI to categorize the document
        const { data, error } = await supabase.functions.invoke('enhanced-contract-assistant', {
          body: {
            analysisType: 'summary',
            contractText: contractText.substring(0, 2000), // First 2000 chars for categorization
            contractId: contractId || 'temp'
          }
        });

        if (error) throw error;

        // Determine category based on content
        const lowerText = contractText.toLowerCase();
        let category: 'CONTRACT' | 'FINANCIAL' | 'IRRELEVANT' = 'IRRELEVANT';
        
        if (lowerText.includes('agreement') || 
            lowerText.includes('contract') || 
            lowerText.includes('party') || 
            lowerText.includes('terms') ||
            lowerText.includes('conditions')) {
          category = 'CONTRACT';
        } else if (lowerText.includes('financial') || 
                   lowerText.includes('revenue') || 
                   lowerText.includes('balance sheet')) {
          category = 'FINANCIAL';
        }

        const summary: DocumentSummary = {
          category,
          title: category === 'CONTRACT' 
            ? 'Contract Document Detected' 
            : category === 'FINANCIAL'
            ? 'Financial Document Detected'
            : 'Document Type Not Recognized',
          message: category === 'CONTRACT'
            ? 'This appears to be a legal contract. You can now use AI analysis features to understand its terms, risks, and obligations.'
            : category === 'FINANCIAL'
            ? 'This appears to be a financial document. Some contract analysis features may not be applicable.'
            : 'This document does not appear to be a legal contract. Contract analysis features may not work as expected.'
        };

        setDocumentSummary(summary);
      } catch (error) {
        console.error('Error analyzing document:', error);
        // Fallback categorization
        const lowerText = contractText.toLowerCase();
        if (lowerText.includes('agreement') || lowerText.includes('contract')) {
          setDocumentSummary({
            category: 'CONTRACT',
            title: 'Contract Document Detected',
            message: 'This appears to be a legal contract based on basic text analysis.'
          });
        } else {
          setDocumentSummary({
            category: 'IRRELEVANT',
            title: 'Document Type Unknown',
            message: 'Unable to determine document type. Upload a legal contract for best results.'
          });
        }
      } finally {
        setLoading(false);
      }
    };

    // Debounce the analysis
    const timeoutId = setTimeout(analyzeDocument, 1000);
    return () => clearTimeout(timeoutId);
  }, [contractText, contractId]);

  return {
    documentSummary,
    loading
  };
};

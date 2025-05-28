
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useContractSummary = (contractText: string, selectedDocumentId?: string) => {
  const { user } = useAuth();
  const [documentSummary, setDocumentSummary] = useState<any>(null);

  useEffect(() => {
    const generateSummary = async () => {
      if (!contractText || !selectedDocumentId || !user) return;

      console.log('Starting AI contract summary generation...');
      
      try {
        // First try the document-ai-assistant function
        const { data: summaryData, error: summaryError } = await supabase.functions.invoke('document-ai-assistant', {
          body: {
            operation: 'summarize_contract',
            content: contractText,
            dealId: 'contract-analysis',
            userId: user.id,
            documentId: selectedDocumentId,
          }
        });

        if (!summaryError && summaryData) {
          console.log('AI summary generated successfully:', summaryData);
          setDocumentSummary({
            category: 'CONTRACT',
            title: 'AI Contract Analysis Complete',
            message: summaryData.summary || 'Your contract has been analyzed by our AI system.',
            analysisDate: new Date().toISOString(),
            keyPoints: summaryData.keyPoints || [
              'Contract successfully uploaded and analyzed',
              'AI-powered analysis tools are now available',
              'You can ask questions about specific clauses'
            ],
            aiGenerated: true,
            fullAnalysis: summaryData
          });
          
          toast.success('AI summary generated!', {
            description: 'Your contract has been analyzed and is ready for questions.'
          });
          return;
        }

        // Fallback to contract-assistant if document-ai-assistant fails
        console.log('Trying fallback contract-assistant function...');
        const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke('contract-assistant', {
          body: {
            question: 'Provide a comprehensive summary of this contract',
            contractText: contractText,
            contractId: selectedDocumentId
          }
        });

        if (!fallbackError && fallbackData) {
          console.log('Fallback AI summary generated:', fallbackData);
          setDocumentSummary({
            category: 'CONTRACT',
            title: 'AI Contract Analysis Complete',
            message: fallbackData.answer || 'Your contract has been analyzed by our AI system.',
            analysisDate: new Date().toISOString(),
            keyPoints: [
              'Contract successfully uploaded and analyzed',
              'AI-powered analysis tools are now available',
              'You can ask questions about specific clauses'
            ],
            aiGenerated: true,
            sources: fallbackData.sources || []
          });
          
          toast.success('AI summary generated!', {
            description: 'Your contract has been analyzed and is ready for questions.'
          });
          return;
        }

        throw new Error('Both AI services are unavailable');
        
      } catch (error) {
        console.error('Error generating AI summary:', error);
        
        // Provide a basic summary as fallback
        setDocumentSummary({
          category: 'CONTRACT',
          title: 'Contract Successfully Uploaded',
          message: 'Your contract has been uploaded and is ready for analysis. AI services are temporarily unavailable, but you can still use the basic analysis features.',
          analysisDate: new Date().toISOString(),
          keyPoints: [
            'Contract is available for analysis',
            'You can view the document content',
            'Basic analysis tools are enabled'
          ],
          aiGenerated: false
        });
        
        toast.warning('Using basic analysis mode', {
          description: 'AI services are temporarily unavailable, but you can still analyze the contract.'
        });
      }
    };

    generateSummary();
  }, [contractText, selectedDocumentId, user]);

  return { documentSummary };
};

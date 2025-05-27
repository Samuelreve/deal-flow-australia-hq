
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

      toast.info('Generating AI summary...', {
        description: 'Our AI is analyzing your contract to create a summary.'
      });
      
      try {
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
            aiGenerated: true
          });
          
          toast.success('AI summary generated!', {
            description: 'Your contract has been analyzed and is ready for questions.'
          });
        } else {
          throw new Error('Failed to generate AI summary');
        }
      } catch (summaryError) {
        console.error('Error generating AI summary:', summaryError);
        setDocumentSummary({
          category: 'CONTRACT',
          title: 'Contract Successfully Uploaded',
          message: 'Your contract has been uploaded and is ready for analysis.',
          analysisDate: new Date().toISOString(),
          keyPoints: [
            'Contract is available for AI analysis',
            'You can now ask questions about the content',
            'Analysis tools are enabled for this document'
          ],
          aiGenerated: false
        });
        
        toast.warning('Using basic summary', {
          description: 'AI summary generation failed, but you can still analyze the contract.'
        });
      }
    };

    generateSummary();
  }, [contractText, selectedDocumentId, user]);

  return { documentSummary };
};


import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ContractAnalysisHeader from '@/components/contract/ContractAnalysisHeader';
import ContractSidebar from '@/components/contract/ContractSidebar';
import ContractAnalysisContent from '@/components/contract/ContractAnalysisContent';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useContractQuestionAnswer } from '@/hooks/contract/useContractQuestionAnswer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentMetadata } from '@/types/contract';
import { toast } from 'sonner';

const ContractAnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [contractText, setContractText] = useState('');
  const [documentSummary, setDocumentSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const questionAnswerState = useContractQuestionAnswer();

  // Fetch uploaded contracts
  useEffect(() => {
    const fetchContracts = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data: contractsData, error: contractsError } = await supabase
          .from('contracts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (contractsError) {
          throw contractsError;
        }

        if (contractsData && contractsData.length > 0) {
          const mappedDocuments: DocumentMetadata[] = contractsData.map(contract => ({
            id: contract.id,
            name: contract.name,
            type: contract.mime_type || 'application/octet-stream',
            uploadDate: contract.created_at,
            status: contract.analysis_status as 'pending' | 'analyzing' | 'completed' | 'error',
            version: '1.0',
            versionDate: contract.updated_at,
            size: contract.file_size,
            category: 'contract'
          }));

          setDocuments(mappedDocuments);
          
          if (mappedDocuments.length > 0) {
            const firstDoc = mappedDocuments[0];
            setSelectedDocument(firstDoc);
            await loadContractContent(firstDoc.id);
          }
        }
      } catch (error: any) {
        console.error('Error fetching contracts:', error);
        setError(error.message || 'Failed to load contracts');
        toast.error('Failed to load contracts');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [user]);

  const loadContractContent = async (contractId: string) => {
    try {
      setLoading(true);
      
      const { data: contractData } = await supabase
        .from('contracts')
        .select('content, name')
        .eq('id', contractId)
        .single();

      if (contractData) {
        if (contractData.content) {
          setContractText(contractData.content);
          
          // Generate AI-powered summary
          toast.info('Generating AI summary...', {
            description: 'Our AI is analyzing your contract to create a summary.'
          });
          
          try {
            const { data: summaryData, error: summaryError } = await supabase.functions.invoke('document-ai-assistant', {
              body: {
                operation: 'summarize_contract',
                content: contractData.content,
                dealId: 'contract-analysis',
                userId: user?.id || 'anonymous',
                documentId: contractId,
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
            // Fallback to basic summary
            setDocumentSummary({
              category: 'CONTRACT',
              title: 'Contract Successfully Uploaded',
              message: 'Your contract has been uploaded and is ready for AI analysis.',
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
        } else {
          setContractText('Contract content is being processed...');
          setDocumentSummary({
            category: 'CONTRACT',
            title: 'Contract Processing',
            message: 'Your contract is being processed. Please wait a moment.',
            analysisDate: new Date().toISOString(),
            keyPoints: ['Document uploaded successfully', 'Content extraction in progress'],
            aiGenerated: false
          });
        }
      }
    } catch (error) {
      console.error('Error loading contract content:', error);
      toast.error('Failed to load contract content');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      toast.info('Uploading contract...', {
        description: 'Your contract is being uploaded and processed.'
      });
      
      let content = '';
      if (file.type === 'text/plain') {
        content = await file.text();
      } else {
        content = `Contract content extracted from ${file.name}. This is a placeholder for the actual extracted text content.`;
      }
      
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .insert({
          name: file.name,
          mime_type: file.type,
          file_size: file.size,
          file_path: `contracts/${user.id}/${file.name}`,
          content: content,
          analysis_status: 'completed',
          user_id: user.id
        })
        .select()
        .single();

      if (contractError) throw contractError;

      const newDocument: DocumentMetadata = {
        id: contractData.id,
        name: file.name,
        type: file.type,
        uploadDate: contractData.created_at,
        status: 'completed',
        version: '1.0',
        versionDate: contractData.created_at,
        size: file.size,
        category: 'contract'
      };

      setDocuments(prev => [newDocument, ...prev]);
      setSelectedDocument(newDocument);
      setContractText(content);
      
      // Generate AI summary for new upload
      toast.info('Generating AI analysis...', {
        description: 'Our AI is analyzing your contract.'
      });

      try {
        const { data: summaryData, error: summaryError } = await supabase.functions.invoke('document-ai-assistant', {
          body: {
            operation: 'summarize_contract',
            content: content,
            dealId: 'contract-analysis',
            userId: user.id,
            documentId: contractData.id,
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
      }
      
      toast.success('Contract uploaded successfully!', {
        description: 'Your contract is now ready for AI-powered analysis.'
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload contract');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmission = async (question: string) => {
    if (!contractText) {
      toast.error('No contract content available for analysis');
      return null;
    }
    return questionAnswerState.handleAskQuestion(question, contractText);
  };
  
  const handleContractAnalysis = async (analysisType: string) => {
    if (!contractText) {
      toast.error('No contract content available for analysis');
      return null;
    }
    return questionAnswerState.handleAnalyzeContract(analysisType, contractText);
  };

  const exportHighlights = () => {
    toast.info('Export functionality not implemented yet');
  };

  return (
    <AppLayout>
      <div className="container py-6 max-w-7xl">
        <ContractAnalysisHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ErrorBoundary>
              <ContractSidebar
                documentMetadata={selectedDocument}
                isAnalyzing={loading}
                documentHighlights={[]}
                onFileUpload={handleFileUpload}
                onExportHighlights={exportHighlights}
              />
            </ErrorBoundary>
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <ContractAnalysisContent
              documentMetadata={selectedDocument}
              contractText={contractText}
              error={error}
              isProcessing={questionAnswerState.isProcessing}
              questionHistory={questionAnswerState.questionHistory}
              onAskQuestion={handleQuestionSubmission}
              onAnalyzeContract={handleContractAnalysis}
              onRetryAnalysis={() => setError(null)}
              documentSummary={documentSummary}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ContractAnalysisPage;

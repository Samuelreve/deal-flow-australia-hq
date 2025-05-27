
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

  // Fetch uploaded contracts (using contracts table instead of documents)
  useEffect(() => {
    const fetchContracts = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch contracts from the contracts table
        const { data: contractsData, error: contractsError } = await supabase
          .from('contracts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (contractsError) {
          throw contractsError;
        }

        if (contractsData && contractsData.length > 0) {
          // Map to DocumentMetadata format
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
          
          // Auto-select the first document if available
          if (mappedDocuments.length > 0) {
            const firstDoc = mappedDocuments[0];
            setSelectedDocument(firstDoc);
            
            // Try to load contract content
            await loadContractContent(firstDoc.id);
          }
        }
      } catch (error: any) {
        console.error('Error fetching contracts:', error);
        setError(error.message || 'Failed to load contracts');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [user]);

  const loadContractContent = async (contractId: string) => {
    try {
      // Get contract content from contracts table
      const { data: contractData } = await supabase
        .from('contracts')
        .select('content, name')
        .eq('id', contractId)
        .single();

      if (contractData) {
        if (contractData.content) {
          setContractText(contractData.content);
        } else {
          setContractText('Contract content is being processed...');
        }
        
        // Create a summary for the contract
        setDocumentSummary({
          category: 'CONTRACT',
          title: 'Contract Successfully Uploaded',
          message: 'Your contract has been uploaded and is ready for analysis.',
          analysisDate: new Date().toISOString(),
          keyPoints: [
            'Contract is available for AI analysis',
            'You can now ask questions about the content',
            'Analysis tools are enabled for this document'
          ]
        });
      }
    } catch (error) {
      console.error('Error loading contract content:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      
      // Read file content
      let content = '';
      if (file.type === 'text/plain') {
        content = await file.text();
      } else {
        // For other file types, simulate content extraction
        content = `Contract content extracted from ${file.name}. This is a placeholder for the actual extracted text content.`;
      }
      
      // Create contract record directly in contracts table
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

      // Create new document metadata
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
      
      // Create summary
      setDocumentSummary({
        category: 'CONTRACT',
        title: 'Contract Successfully Uploaded',
        message: 'Your contract has been uploaded and is ready for analysis.',
        analysisDate: new Date().toISOString(),
        keyPoints: [
          'Contract is available for AI analysis',
          'You can now ask questions about the content',
          'Analysis tools are enabled for this document'
        ]
      });
      
      toast.success('Contract uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload contract');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmission = async (question: string) => {
    return questionAnswerState.handleAskQuestion(question, contractText);
  };
  
  const handleContractAnalysis = async (analysisType: string) => {
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
          {/* Left Column - Document Info and Upload */}
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
          
          {/* Main Column - Analysis and Interactive Features */}
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

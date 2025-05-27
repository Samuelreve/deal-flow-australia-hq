
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

  // Fetch uploaded documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch documents from the database
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select(`
            id,
            name,
            type,
            size,
            created_at,
            updated_at,
            status,
            category,
            latest_version_id
          `)
          .order('created_at', { ascending: false });

        if (documentsError) {
          throw documentsError;
        }

        if (documentsData && documentsData.length > 0) {
          // Map to DocumentMetadata format
          const mappedDocuments: DocumentMetadata[] = documentsData.map(doc => ({
            id: doc.id,
            name: doc.name,
            type: doc.type || 'application/octet-stream',
            uploadDate: doc.created_at,
            status: doc.status as 'pending' | 'analyzing' | 'completed' | 'error',
            version: '1.0',
            versionDate: doc.updated_at,
            size: doc.size,
            category: doc.category
          }));

          setDocuments(mappedDocuments);
          
          // Auto-select the first document if available
          if (mappedDocuments.length > 0) {
            const firstDoc = mappedDocuments[0];
            setSelectedDocument(firstDoc);
            
            // Try to fetch document content and summary
            await loadDocumentContent(firstDoc.id);
          }
        }
      } catch (error: any) {
        console.error('Error fetching documents:', error);
        setError(error.message || 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user]);

  const loadDocumentContent = async (documentId: string) => {
    try {
      // Try to get document content from storage or analysis
      const { data: versionsData } = await supabase
        .from('document_versions')
        .select('storage_path, type')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (versionsData && versionsData.length > 0) {
        // For now, set a placeholder text since we'd need to extract content from the file
        setContractText('Document content would be extracted here from the uploaded file.');
        
        // Create a mock summary for the uploaded document
        setDocumentSummary({
          category: 'CONTRACT',
          title: 'Document Successfully Uploaded',
          message: 'Your document has been uploaded and is ready for analysis.',
          analysisDate: new Date().toISOString(),
          keyPoints: [
            'Document is available for AI analysis',
            'You can now ask questions about the content',
            'Analysis tools are enabled for this document'
          ]
        });
      }
    } catch (error) {
      console.error('Error loading document content:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      
      // Create document record
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          type: file.type,
          size: file.size,
          category: 'contract',
          status: 'completed'
        })
        .select()
        .single();

      if (documentError) throw documentError;

      // Create version record
      const { data: versionData, error: versionError } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentData.id,
          version_number: 1,
          size: file.size,
          type: file.type,
          description: 'Initial upload'
        })
        .select()
        .single();

      if (versionError) throw versionError;

      // Update document with latest version
      await supabase
        .from('documents')
        .update({ latest_version_id: versionData.id })
        .eq('id', documentData.id);

      // Refresh documents list
      const newDocument: DocumentMetadata = {
        id: documentData.id,
        name: file.name,
        type: file.type,
        uploadDate: documentData.created_at,
        status: 'completed',
        version: '1.0',
        versionDate: documentData.created_at,
        size: file.size,
        category: 'contract'
      };

      setDocuments(prev => [newDocument, ...prev]);
      setSelectedDocument(newDocument);
      await loadDocumentContent(documentData.id);
      
      toast.success('Document uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
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

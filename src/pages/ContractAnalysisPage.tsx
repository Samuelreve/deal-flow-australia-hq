
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ContractAnalysisHeader from '@/components/contract/ContractAnalysisHeader';
import ContractSidebar from '@/components/contract/ContractSidebar';
import ContractAnalysisContent from '@/components/contract/ContractAnalysisContent';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useContractQuestionAnswer } from '@/hooks/contract/useContractQuestionAnswer';
import { useContractData } from '@/hooks/contract/useContractData';
import { useContractUpload } from '@/hooks/contract/useContractUpload';
import { useContractSummary } from '@/hooks/contract/useContractSummary';
import { toast } from 'sonner';

const ContractAnalysisPage: React.FC = () => {
  console.log('ContractAnalysisPage rendering...');
  
  // All hooks must be called unconditionally at the top level
  const contractDataState = useContractData();
  const questionAnswerState = useContractQuestionAnswer();
  
  // Extract values from contractDataState to avoid destructuring in render
  const {
    documents,
    selectedDocument,
    contractText,
    loading,
    error,
    setDocuments,
    setSelectedDocument,
    setContractText,
    resetData
  } = contractDataState;

  console.log('Contract data state:', {
    documentsCount: documents.length,
    selectedDocument: selectedDocument?.name,
    contractTextLength: contractText.length,
    loading,
    error
  });

  // Call upload hook with stable dependencies
  const uploadState = useContractUpload(
    setDocuments,
    setSelectedDocument,
    setContractText
  );

  // Call summary hook with stable dependencies
  const summaryState = useContractSummary(contractText, selectedDocument?.id);

  // Extract values to avoid destructuring issues
  const { uploading, handleFileUpload } = uploadState;
  const { documentSummary } = summaryState;

  console.log('Upload state:', { uploading });

  // Define handlers as stable functions
  const handleQuestionSubmission = React.useCallback(async (question: string) => {
    console.log('Handling question submission:', question);
    if (!contractText) {
      toast.error('No contract content available for analysis');
      return null;
    }
    return questionAnswerState.handleAskQuestion(question, contractText);
  }, [contractText, questionAnswerState.handleAskQuestion]);
  
  const handleContractAnalysis = React.useCallback(async (analysisType: string) => {
    console.log('Handling contract analysis:', analysisType);
    if (!contractText) {
      toast.error('No contract content available for analysis');
      return null;
    }
    return questionAnswerState.handleAnalyzeContract(analysisType, contractText);
  }, [contractText, questionAnswerState.handleAnalyzeContract]);

  const exportHighlights = React.useCallback(() => {
    console.log('Export highlights called');
    toast.info('Export functionality not implemented yet');
  }, []);

  const handleRetryAnalysis = React.useCallback(() => {
    console.log('Retry analysis called');
    resetData();
  }, [resetData]);

  const wrappedFileUpload = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File upload wrapper called');
    try {
      await handleFileUpload(e);
    } catch (error) {
      console.error('Error in file upload wrapper:', error);
      toast.error('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }, [handleFileUpload]);

  return (
    <AppLayout>
      <div className="container py-6 max-w-7xl">
        <ContractAnalysisHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ErrorBoundary>
              <ContractSidebar
                documentMetadata={selectedDocument}
                isAnalyzing={loading || uploading}
                documentHighlights={[]}
                onFileUpload={wrappedFileUpload}
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
              onRetryAnalysis={handleRetryAnalysis}
              documentSummary={documentSummary}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ContractAnalysisPage;

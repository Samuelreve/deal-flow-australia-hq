
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
    setError
  } = contractDataState;

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

  // Define handlers as stable functions
  const handleQuestionSubmission = React.useCallback(async (question: string) => {
    if (!contractText) {
      toast.error('No contract content available for analysis');
      return null;
    }
    return questionAnswerState.handleAskQuestion(question, contractText);
  }, [contractText, questionAnswerState.handleAskQuestion]);
  
  const handleContractAnalysis = React.useCallback(async (analysisType: string) => {
    if (!contractText) {
      toast.error('No contract content available for analysis');
      return null;
    }
    return questionAnswerState.handleAnalyzeContract(analysisType, contractText);
  }, [contractText, questionAnswerState.handleAnalyzeContract]);

  const exportHighlights = React.useCallback(() => {
    toast.info('Export functionality not implemented yet');
  }, []);

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


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
  } = useContractData();

  const { uploading, handleFileUpload } = useContractUpload(
    setDocuments,
    setSelectedDocument,
    setContractText
  );

  const { documentSummary } = useContractSummary(contractText, selectedDocument?.id);

  const questionAnswerState = useContractQuestionAnswer();

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

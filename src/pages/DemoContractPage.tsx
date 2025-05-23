
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ContractPageHeader from '@/components/contract/ContractPageHeader';
import ContractSidebar from '@/components/contract/ContractSidebar';
import DemoContractContent from '@/components/contract/DemoContractContent';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useContractDocumentUpload } from '@/hooks/contract/useContractDocumentUpload';
import { useContractInteractions } from '@/hooks/contract/useContractInteractions';
import { useDemoContractState } from '@/hooks/contract/useDemoContractState';

const DemoContractPage: React.FC = () => {
  // Use our custom hooks
  const { analysisState, questionAnswerState } = useDemoContractState();
  const { exportHighlightsToCSV, handleAnalyzeContract } = useContractInteractions();
  
  const uploadHandler = useContractDocumentUpload({
    onUploadSuccess: (metadata, text, summary) => {
      analysisState.setDocumentMetadata(metadata);
      analysisState.setContractText(text || '');
      analysisState.setCustomSummary(summary);
    },
    onUploadError: (error) => {
      analysisState.setError(error);
    }
  });

  // Wrap the handleAskQuestion to match the expected interface
  const handleQuestionSubmission = async (question: string) => {
    return questionAnswerState.handleAskQuestion(question);
  };
  
  // Wrap the handleAnalyzeContract function to handle question history
  const handleContractAnalysis = async (analysisType: string) => {
    return handleAnalyzeContract(
      questionAnswerState.setQuestionHistory,
      analysisType
    );
  };

  return (
    <AppLayout>
      <div className="container py-6 max-w-5xl">
        <ContractPageHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Document Info and Upload */}
          <ErrorBoundary>
            <ContractSidebar
              documentMetadata={analysisState.documentMetadata}
              isAnalyzing={analysisState.isAnalyzing}
              documentHighlights={analysisState.documentHighlights}
              onFileUpload={uploadHandler.handleFileUpload}
              onExportHighlights={() => exportHighlightsToCSV(analysisState.documentHighlights)}
            />
          </ErrorBoundary>
          
          {/* Main Column - Analysis */}
          <DemoContractContent
            documentMetadata={analysisState.documentMetadata}
            contractText={analysisState.contractText}
            error={analysisState.error}
            isProcessing={questionAnswerState.isProcessing}
            questionHistory={questionAnswerState.questionHistory}
            onAskQuestion={handleQuestionSubmission}
            onAnalyzeContract={handleContractAnalysis}
            onRetryAnalysis={() => analysisState.setError(null)}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default DemoContractPage;


import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ContractAnalysisHeader from '@/components/contract/ContractAnalysisHeader';
import ContractSidebar from '@/components/contract/ContractSidebar';
import ContractAnalysisContent from '@/components/contract/ContractAnalysisContent';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useContractDocumentUpload } from '@/hooks/contract/useContractDocumentUpload';
import { useContractInteractions } from '@/hooks/contract/useContractInteractions';
import { useContractAnalysisState } from '@/hooks/contract/useContractAnalysisState';
import { useContractQuestionAnswer } from '@/hooks/contract/useContractQuestionAnswer';

const ContractAnalysisPage: React.FC = () => {
  const analysisState = useContractAnalysisState();
  const questionAnswerState = useContractQuestionAnswer();
  const { exportHighlightsToCSV } = useContractInteractions();
  
  const uploadHandler = useContractDocumentUpload({
    onUploadSuccess: (metadata, text, summary) => {
      analysisState.setDocumentMetadata(metadata);
      analysisState.setContractText(text || '');
      analysisState.setCustomSummary(summary);
      analysisState.setError(null);
    },
    onUploadError: (error) => {
      analysisState.setError(error);
    }
  });

  const handleQuestionSubmission = async (question: string) => {
    return questionAnswerState.handleAskQuestion(question, analysisState.contractText);
  };
  
  const handleContractAnalysis = async (analysisType: string) => {
    return questionAnswerState.handleAnalyzeContract(analysisType, analysisState.contractText);
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
                documentMetadata={analysisState.documentMetadata}
                isAnalyzing={analysisState.isAnalyzing}
                documentHighlights={analysisState.documentHighlights}
                onFileUpload={uploadHandler.handleFileUpload}
                onExportHighlights={() => exportHighlightsToCSV(analysisState.documentHighlights)}
              />
            </ErrorBoundary>
          </div>
          
          {/* Main Column - Analysis and Interactive Features */}
          <div className="lg:col-span-3 space-y-6">
            <ContractAnalysisContent
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
      </div>
    </AppLayout>
  );
};

export default ContractAnalysisPage;

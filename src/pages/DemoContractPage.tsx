
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import DemoContractHeader from '@/components/contract/DemoContractHeader';
import ContractSidebar from '@/components/contract/ContractSidebar';
import DemoContractContent from '@/components/contract/DemoContractContent';
import InteractiveDemoFeatures from '@/components/contract/InteractiveDemoFeatures';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useContractDocumentUpload } from '@/hooks/contract/useContractDocumentUpload';
import { useContractInteractions } from '@/hooks/contract/useContractInteractions';
import { useDemoContractState } from '@/hooks/contract/useDemoContractState';
import { useDemoContractInteractions } from '@/hooks/contract/useDemoContractInteractions';

const DemoContractPage: React.FC = () => {
  // Use our custom hooks
  const { analysisState, questionAnswerState } = useDemoContractState();
  const { exportHighlightsToCSV } = useContractInteractions();
  const { handleAnalyzeContract } = useDemoContractInteractions();
  
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadHandler.handleFileUpload(file);
    }
  };

  // Wrap the handleAskQuestion to match the expected interface
  const handleQuestionSubmission = async (question: string) => {
    return questionAnswerState.handleAskQuestion(question, '');
  };
  
  // Fix the handleAnalyzeContract function call to match the expected signature
  const handleContractAnalysis = async (analysisType: string) => {
    return handleAnalyzeContract(
      analysisType,
      questionAnswerState.setQuestionHistory
    );
  };

  return (
    <AppLayout>
      <div className="container py-6 max-w-7xl">
        <DemoContractHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Document Info and Upload */}
          <div className="lg:col-span-1">
            <ErrorBoundary>
              <ContractSidebar
                documentMetadata={analysisState.documentMetadata}
                isAnalyzing={analysisState.isAnalyzing}
                documentHighlights={analysisState.documentHighlights}
                onFileUpload={handleFileUpload}
                onExportHighlights={() => exportHighlightsToCSV(analysisState.documentHighlights)}
              />
            </ErrorBoundary>
          </div>
          
          {/* Main Column - Analysis and Interactive Features */}
          <div className="lg:col-span-3 space-y-6">
            {/* Interactive Demo Features */}
            <InteractiveDemoFeatures onAskQuestion={handleQuestionSubmission} />
            
            {/* Contract Analysis */}
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
      </div>
    </AppLayout>
  );
};

export default DemoContractPage;

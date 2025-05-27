
import React, { useState } from 'react';
import { useContractAnalysis } from '@/hooks/useContractAnalysis';
import { useAIStatusManager } from '@/hooks/contract-analysis/useAIStatusManager';
import ContractAnalysisHeader from '@/components/contract-analysis/ContractAnalysisHeader';
import ContractUploadSection from '@/components/contract-analysis/ContractUploadSection';
import ContractViewer from '@/components/contract-analysis/ContractViewer';
import AnalysisPanel from '@/components/contract-analysis/AnalysisPanel';
import QuestionPanel from '@/components/contract-analysis/QuestionPanel';

interface QuestionHistoryItem {
  question: string;
  answer: string | { answer: string; sources?: string[] };
  timestamp: number;
  type: 'question' | 'analysis';
}

const ContractAnalysis = () => {
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  
  const {
    documentMetadata,
    contractText,
    customSummary,
    mockSummary,
    isAnalyzing,
    analysisStage,
    analysisProgress,
    isProcessing,
    documentHighlights,
    setDocumentHighlights,
    exportHighlightsToCSV,
    handleFileUpload,
    handleAskQuestion: originalHandleAskQuestion
  } = useContractAnalysis();

  const { aiStatus } = useAIStatusManager(handleFileUpload, originalHandleAskQuestion);

  // Wrap the original handleAskQuestion to match the expected interface
  const handleAskQuestion = async (question: string): Promise<{ answer: string; sources?: string[] }> => {
    try {
      const result = await originalHandleAskQuestion(question);
      
      // Add to question history with proper format
      const historyItem: QuestionHistoryItem = {
        question,
        answer: result,
        timestamp: Date.now(),
        type: 'question'
      };
      
      setQuestionHistory(prev => [...prev, historyItem]);
      
      return result;
    } catch (error) {
      console.error('Error asking question:', error);
      throw error;
    }
  };

  const currentSummary = customSummary || mockSummary;

  return (
    <div className="min-h-screen bg-gray-50">
      <ContractAnalysisHeader aiStatus={aiStatus} />

      <div className="container mx-auto px-4 py-6">
        {!contractText ? (
          <ContractUploadSection handleFileUpload={handleFileUpload} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contract Viewer */}
            <div className="lg:col-span-2">
              <ContractViewer
                contractText={contractText}
                documentHighlights={documentHighlights}
                setDocumentHighlights={setDocumentHighlights}
                isAnalyzing={isAnalyzing}
                analysisStage={analysisStage}
                analysisProgress={analysisProgress}
              />
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Analysis Panel */}
              <AnalysisPanel
                summaryData={currentSummary}
                isAnalyzing={isAnalyzing}
                exportHighlightsToCSV={exportHighlightsToCSV}
                documentHighlights={documentHighlights}
              />

              {/* Question Panel */}
              <QuestionPanel
                questionHistory={questionHistory}
                isProcessing={isProcessing}
                onAskQuestion={handleAskQuestion}
                aiStatus={aiStatus}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractAnalysis;

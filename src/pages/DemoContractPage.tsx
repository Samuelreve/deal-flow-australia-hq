
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';
import ContractPageHeader from '@/components/contract/ContractPageHeader';
import ContractSidebar from '@/components/contract/ContractSidebar';
import ContractMainContent from '@/components/contract/ContractMainContent';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useContractAnalysisState } from '@/hooks/contract/useContractAnalysisState';
import { useContractDocumentUpload } from '@/hooks/contract/useContractDocumentUpload';
import { useContractQuestionAnswer } from '@/hooks/contract/useContractQuestionAnswer';
import { mockSummaryData } from '@/hooks/contract-analysis/mockData';

const DemoContractPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("summary");
  
  // Use our custom hooks
  const analysisState = useContractAnalysisState();
  const questionAnswerState = useContractQuestionAnswer();
  
  const uploadHandler = useContractDocumentUpload({
    onUploadSuccess: (metadata, text, summary) => {
      analysisState.setDocumentMetadata(metadata);
      analysisState.setContractText(text);
      analysisState.setCustomSummary(summary);
    },
    onUploadError: (error) => {
      analysisState.setError(error);
    }
  });

  const exportHighlightsToCSV = () => {
    if (analysisState.documentHighlights.length === 0) {
      toast.error('No highlights to export');
      return;
    }
    
    try {
      const headers = ['Text', 'Category', 'Note', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...analysisState.documentHighlights.map(highlight => {
          return [
            `"${highlight.text.replace(/"/g, '""')}"`,
            highlight.category || '',
            `"${(highlight.note || '').replace(/"/g, '""')}"`,
            new Date(highlight.createdAt).toLocaleString()
          ].join(',');
        })
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `contract-highlights-${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Highlights exported successfully');
    } catch (error) {
      console.error('Error exporting highlights:', error);
      toast.error('Failed to export highlights');
    }
  };
  
  useEffect(() => {
    const shouldAnalyze = searchParams.get("analyze") === "true";
    
    if (shouldAnalyze && !analysisState.isAnalyzing) {
      toast.success("Contract analyzed successfully", {
        description: "AI summary and insights are now available"
      });
    }
  }, [searchParams, analysisState.isAnalyzing]);
  
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
              onExportHighlights={exportHighlightsToCSV}
            />
          </ErrorBoundary>
          
          {/* Main Column - Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <ErrorBoundary>
              <ContractMainContent
                isAnalyzing={analysisState.isAnalyzing}
                analysisStage={analysisState.analysisProgress.stage}
                analysisProgress={analysisState.analysisProgress.progress}
                activeTab={activeTab}
                customSummary={analysisState.customSummary}
                mockSummary={mockSummaryData}
                contractText={analysisState.contractText}
                questionHistory={questionAnswerState.questionHistory}
                isProcessing={questionAnswerState.isProcessing}
                onTabChange={setActiveTab}
                onAskQuestion={questionAnswerState.handleAskQuestion}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DemoContractPage;

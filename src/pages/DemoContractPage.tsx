
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';
import ContractPageHeader from '@/components/contract/ContractPageHeader';
import ContractSidebar from '@/components/contract/ContractSidebar';
import ContractMainContent from '@/components/contract/ContractMainContent';
import { useContractAnalysis } from '@/hooks/contract-analysis/useContractAnalysis';

const DemoContractPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("summary");
  
  const {
    documentMetadata,
    contractText,
    customSummary,
    mockSummary,
    isAnalyzing,
    analysisStage,
    analysisProgress,
    questionHistory,
    isProcessing,
    documentHighlights,
    setDocumentHighlights,
    exportHighlightsToCSV,
    handleFileUpload,
    handleAskQuestion
  } = useContractAnalysis();
  
  useEffect(() => {
    // Check URL parameters to see if we should auto-analyze
    const shouldAnalyze = searchParams.get("analyze") === "true";
    
    if (shouldAnalyze && !isAnalyzing) {
      // Simulate AI analysis delay
      toast.success("Contract analyzed successfully", {
        description: "AI summary and insights are now available"
      });
    }
  }, [searchParams, isAnalyzing]);
  
  return (
    <AppLayout>
      <div className="container py-6 max-w-5xl">
        <ContractPageHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Document Info and Upload */}
          <ContractSidebar
            documentMetadata={documentMetadata}
            isAnalyzing={isAnalyzing}
            documentHighlights={documentHighlights}
            onFileUpload={handleFileUpload}
            onExportHighlights={exportHighlightsToCSV}
          />
          
          {/* Main Column - Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <ContractMainContent
              isAnalyzing={isAnalyzing}
              analysisStage={analysisStage}
              analysisProgress={analysisProgress}
              activeTab={activeTab}
              customSummary={customSummary}
              mockSummary={mockSummary}
              contractText={contractText}
              questionHistory={questionHistory}
              isProcessing={isProcessing}
              onTabChange={setActiveTab}
              onAskQuestion={handleAskQuestion}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DemoContractPage;

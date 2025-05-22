
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';
import DocumentDetails from '@/components/contract/DocumentDetails';
import DocumentVersions from '@/components/contract/DocumentVersions';
import ContractAnalyzingState from '@/components/contract/ContractAnalyzingState';
import ContractSummaryTab from '@/components/contract/tabs/ContractSummaryTab';
import ContractAssistantTab from '@/components/contract/tabs/ContractAssistantTab';
import DocumentTab from '@/components/contract/tabs/DocumentTab';
import { useContractAnalysis } from '@/hooks/useContractAnalysis';

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Smart Contract Analysis</h1>
          <p className="text-muted-foreground">
            AI-powered analysis and insights for your legal documents
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Document Info and Upload button */}
          <div className="space-y-6">
            {/* Document Details Card */}
            <DocumentDetails 
              documentMetadata={documentMetadata}
              isAnalyzing={isAnalyzing}
              onFileUpload={handleFileUpload}
            />
            
            {/* Document Versions */}
            <DocumentVersions documentMetadata={documentMetadata} />
          </div>
          
          {/* Main Column - Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loading state */}
            {isAnalyzing ? (
              <ContractAnalyzingState stage={analysisStage} progress={analysisProgress} />
            ) : (
              <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="summary">Contract Summary</TabsTrigger>
                  <TabsTrigger value="assistant">Ask Questions</TabsTrigger>
                  <TabsTrigger value="document">Full Document</TabsTrigger>
                </TabsList>
                
                {/* Summary Tab */}
                <TabsContent value="summary">
                  <ContractSummaryTab 
                    summaryData={customSummary || mockSummary} 
                    isLoading={isAnalyzing} 
                  />
                </TabsContent>
                
                {/* Assistant Tab */}
                <TabsContent value="assistant">
                  <ContractAssistantTab onAskQuestion={handleAskQuestion} />
                </TabsContent>
                
                {/* Document Tab */}
                <TabsContent value="document">
                  <DocumentTab contractText={contractText} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DemoContractPage;

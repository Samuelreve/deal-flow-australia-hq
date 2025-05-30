import React, { useState } from 'react';
import ContractMainContent from '@/components/contract/ContractMainContent';
import InteractiveDemoFeatures from '@/components/contract/InteractiveDemoFeatures';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { DocumentMetadata, QuestionHistoryItem } from '@/types/contract';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";

interface DemoContractContentProps {
  documentMetadata: DocumentMetadata | null;
  contractText: string;
  error: string | null;
  isProcessing: boolean;
  questionHistory: QuestionHistoryItem[];
  onAskQuestion: (question: string) => Promise<any>;
  onAnalyzeContract: (analysisType: string) => Promise<any>;
  onRetryAnalysis: () => void;
}

const DemoContractContent: React.FC<DemoContractContentProps> = ({
  documentMetadata,
  contractText,
  error,
  isProcessing,
  questionHistory,
  onAskQuestion,
  onAnalyzeContract,
  onRetryAnalysis
}) => {
  const [activeTab, setActiveTab] = useState("summary");

  // Show upload prompt if no contract is loaded
  if (!contractText) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed border-2 border-gray-300">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Upload a Contract to Begin</CardTitle>
            <CardDescription>
              Upload a contract document to start AI-powered analysis, ask questions, and get insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <FileText className="h-8 w-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium">AI Analysis</span>
                <span className="text-xs text-gray-600">Get comprehensive contract insights</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <FileText className="h-8 w-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium">Q&A Assistant</span>
                <span className="text-xs text-gray-600">Ask questions about clauses</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <FileText className="h-8 w-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium">Risk Assessment</span>
                <span className="text-xs text-gray-600">Identify potential issues</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create a real contract object for ContractMainContent
  const contract = {
    id: documentMetadata?.id || 'uploaded-contract',
    name: documentMetadata?.name || 'Uploaded Contract',
    content: contractText,
    file_size: contractText.length,
    upload_date: documentMetadata?.uploadDate || new Date().toISOString(),
    analysis_status: 'completed' as const
  };

  return (
    <div className="space-y-6">
      {/* Interactive Demo Features - only show if contract is loaded */}
      <InteractiveDemoFeatures onAskQuestion={onAskQuestion} />
      
      {/* Contract Analysis */}
      <ErrorBoundary>
        <ContractMainContent
          selectedContract={contract}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAskQuestion={onAskQuestion}
          onAnalyzeContract={onAnalyzeContract}
          questionHistory={questionHistory}
          isProcessing={isProcessing}
          error={error}
          onRetryAnalysis={onRetryAnalysis}
        />
      </ErrorBoundary>
    </div>
  );
};

export default DemoContractContent;

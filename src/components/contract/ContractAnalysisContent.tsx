
import React, { useState } from 'react';
import ContractMainContent from '@/components/contract/ContractMainContent';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { DocumentMetadata } from '@/types/contract';
import { QuestionHistoryItem } from '@/hooks/contract/useContractQuestionAnswer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ContractAnalysisContentProps {
  documentMetadata: DocumentMetadata | null;
  contractText: string;
  error: string | null;
  isProcessing: boolean;
  questionHistory: QuestionHistoryItem[];
  onAskQuestion: (question: string) => Promise<any>;
  onAnalyzeContract: (analysisType: string) => Promise<any>;
  onRetryAnalysis: () => void;
}

const ContractAnalysisContent: React.FC<ContractAnalysisContentProps> = ({
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

  // Show upload prompt if no document is loaded
  if (!documentMetadata || !contractText) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardContent className="text-center space-y-4">
          <div className="mx-auto p-4 bg-muted rounded-full w-fit">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">Upload a Contract</CardTitle>
            <CardDescription className="mt-2">
              Upload your contract document to get started with AI-powered analysis
            </CardDescription>
          </div>
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Supported formats: PDF, Word documents (.docx, .doc), and text files
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Create contract object for ContractMainContent
  const contract = {
    id: documentMetadata.id || 'contract-analysis',
    name: documentMetadata.name,
    content: contractText,
    file_size: documentMetadata.size || contractText.length,
    upload_date: documentMetadata.uploadDate,
    analysis_status: documentMetadata.status
  };

  return (
    <div className="space-y-6">
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

export default ContractAnalysisContent;

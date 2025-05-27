
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import { DocumentMetadata, QuestionHistoryItem } from '@/types/contract';
import ContractSummaryTab from './tabs/ContractSummaryTab';
import ContractAssistantTab from './tabs/ContractAssistantTab';
import ContractAnalysisTab from './tabs/ContractAnalysisTab';

interface ContractAnalysisContentProps {
  documentMetadata: DocumentMetadata | null;
  contractText: string;
  error: string | null;
  isProcessing: boolean;
  questionHistory: QuestionHistoryItem[];
  onAskQuestion: (question: string) => Promise<{ answer: string; sources?: string[] } | null>;
  onAnalyzeContract: (analysisType: string) => Promise<{ analysis: string; sources?: string[] } | null>;
  onRetryAnalysis: () => void;
  documentSummary?: any;
}

const ContractAnalysisContent: React.FC<ContractAnalysisContentProps> = ({
  documentMetadata,
  contractText,
  error,
  isProcessing,
  questionHistory,
  onAskQuestion,
  onAnalyzeContract,
  onRetryAnalysis,
  documentSummary
}) => {
  const [activeTab, setActiveTab] = useState("summary");

  // Show upload prompt if no document
  if (!documentMetadata) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload a Contract to Get Started</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Upload a legal document (PDF, Word, or text file) to analyze its content and get AI-powered insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analysis Error</h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            {error}
          </p>
          <button 
            onClick={onRetryAnalysis}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Try Again
          </button>
        </CardContent>
      </Card>
    );
  }

  // Show document category alert
  const renderDocumentAlert = () => {
    if (!documentSummary) return null;

    if (documentSummary.category === 'CONTRACT') {
      return (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>{documentSummary.title}</strong>
            <br />
            {documentSummary.message}
          </AlertDescription>
        </Alert>
      );
    }

    if (documentSummary.category === 'FINANCIAL') {
      return (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>{documentSummary.title}</strong>
            <br />
            {documentSummary.message}
          </AlertDescription>
        </Alert>
      );
    }

    if (documentSummary.category === 'IRRELEVANT') {
      return (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{documentSummary.title}</strong>
            <br />
            {documentSummary.message}
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {renderDocumentAlert()}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger 
                value="assistant" 
                className={documentSummary?.category === 'CONTRACT' ? '' : 'opacity-50'}
                disabled={documentSummary?.category !== 'CONTRACT'}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Ask Questions
              </TabsTrigger>
              <TabsTrigger 
                value="analysis"
                className={documentSummary?.category === 'CONTRACT' ? '' : 'opacity-50'}
                disabled={documentSummary?.category !== 'CONTRACT'}
              >
                Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-6">
              <ContractSummaryTab 
                documentSummary={documentSummary} 
                isAnalyzing={isProcessing}
              />
            </TabsContent>

            <TabsContent value="assistant" className="mt-6">
              <ContractAssistantTab
                onAskQuestion={onAskQuestion}
                questionHistory={questionHistory}
                isProcessing={isProcessing}
                contractText={contractText}
                documentSummary={documentSummary}
              />
            </TabsContent>

            <TabsContent value="analysis" className="mt-6">
              <ContractAnalysisTab
                onAnalyzeContract={onAnalyzeContract}
                questionHistory={questionHistory}
                isProcessing={isProcessing}
                contractText={contractText}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractAnalysisContent;

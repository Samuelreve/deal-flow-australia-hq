
import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import { ContractAnalysisLoading } from './loading/ContractLoadingStates';
import { ContractAnalysisError } from './error/ContractErrorStates';
import { contractAriaLabels } from './accessibility/ContractAccessibility';

// Lazy load heavy components
const EnhancedContractAssistantTab = React.lazy(() => 
  import('./tabs/EnhancedContractAssistantTab')
);

interface Contract {
  id: string;
  name: string;
  content?: string;
  file_size: number;
  upload_date: string;
  analysis_status: string;
}

interface HistoryItem {
  question: string;
  answer: string;
  timestamp: number;
  type: 'question' | 'analysis';
  analysisType?: string;
}

interface ContractMainContentProps {
  selectedContract: Contract | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAskQuestion: (question: string) => Promise<any>;
  onAnalyzeContract: (analysisType: string) => Promise<any>;
  questionHistory: HistoryItem[];
  isProcessing: boolean;
  error?: string | null;
  onRetryAnalysis?: () => void;
}

const ContractMainContent: React.FC<ContractMainContentProps> = ({
  selectedContract,
  activeTab,
  onTabChange,
  onAskQuestion,
  onAnalyzeContract,
  questionHistory,
  isProcessing,
  error,
  onRetryAnalysis
}) => {
  if (!selectedContract) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold mb-2">No Contract Selected</h3>
          <p className="text-muted-foreground">
            Upload a new contract or select an existing one to begin analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <ContractAnalysisError 
        error={error} 
        onRetry={onRetryAnalysis}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Contract Analysis: {selectedContract.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedContract.analysis_status === 'completed' ? (
          <Tabs 
            value={activeTab} 
            onValueChange={onTabChange}
            className="w-full"
          >
            <TabsList 
              className="grid w-full grid-cols-2"
              role="tablist"
              aria-label="Contract analysis options"
            >
              <TabsTrigger 
                value="summary"
                role="tab"
                aria-label={contractAriaLabels.analysisTab('summary')}
              >
                Summary
              </TabsTrigger>
              <TabsTrigger 
                value="assistant"
                role="tab"
                aria-label={contractAriaLabels.analysisTab('AI assistant')}
              >
                AI Assistant
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4 mt-6">
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Document Information</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><span className="font-medium">File:</span> {selectedContract.name}</p>
                  <p><span className="font-medium">Size:</span> {(selectedContract.file_size / 1024).toFixed(1)} KB</p>
                  <p><span className="font-medium">Uploaded:</span> {new Date(selectedContract.upload_date).toLocaleDateString()}</p>
                  <p><span className="font-medium">Status:</span> {selectedContract.analysis_status}</p>
                </div>
              </div>
              {selectedContract.content && (
                <div className="bg-muted p-4 rounded-md max-h-60 overflow-y-auto">
                  <h3 className="font-medium mb-2">Content Preview</h3>
                  <p className="text-sm">{selectedContract.content.substring(0, 500)}...</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="assistant" className="mt-6">
              <Suspense fallback={<ContractAnalysisLoading />}>
                <EnhancedContractAssistantTab
                  onAskQuestion={onAskQuestion}
                  onAnalyzeContract={onAnalyzeContract}
                  questionHistory={questionHistory}
                  isProcessing={isProcessing}
                  contractText={selectedContract.content || ''}
                />
              </Suspense>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              {selectedContract.analysis_status === 'processing' 
                ? <ContractAnalysisLoading />
                : selectedContract.analysis_status === 'error'
                ? 'Error processing document'
                : 'Document analysis pending'
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractMainContent;


import React, { Suspense, memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Loader2 } from "lucide-react";
import { ContractProcessingState, MinimalLoadingSpinner } from '../loading/EnhancedLoadingStates';
import { ContractAnalysisErrorEnhanced } from '../error/EnhancedErrorStates';
import { contractAriaLabelsEnhanced } from '../accessibility/EnhancedAccessibility';

// Lazy load heavy components for better performance
const EnhancedContractAssistantTab = React.lazy(() => 
  import('../tabs/EnhancedContractAssistantTab')
);

const ContractSummaryTab = React.lazy(() => 
  import('../tabs/ContractSummaryTab')
);

const DocumentTab = React.lazy(() => 
  import('../tabs/DocumentTab')
);

interface Contract {
  id: string;
  name: string;
  content?: string;
  file_size: number;
  upload_date: string;
  analysis_status: string;
}

interface OptimizedContractMainContentProps {
  selectedContract: Contract | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAskQuestion: (question: string) => Promise<any>;
  onAnalyzeContract: (analysisType: string) => Promise<any>;
  questionHistory: any[];
  isProcessing: boolean;
  error?: string | null;
  onRetryAnalysis?: () => void;
}

// Memoized empty state component
const EmptyState = memo(() => (
  <Card>
    <CardContent className="p-8 text-center">
      <FileText 
        className="h-12 w-12 mx-auto text-muted-foreground mb-4" 
        aria-hidden="true" 
      />
      <h3 className="text-lg font-semibold mb-2">No Contract Selected</h3>
      <p className="text-muted-foreground">
        Upload a new contract or select an existing one to begin analysis.
      </p>
    </CardContent>
  </Card>
));

EmptyState.displayName = 'EmptyState';

// Memoized loading fallback
const TabLoadingFallback = memo(() => (
  <div className="p-6">
    <MinimalLoadingSpinner text="Loading tab content..." />
  </div>
));

TabLoadingFallback.displayName = 'TabLoadingFallback';

// Memoized document info component
const DocumentInfo = memo<{ contract: Contract }>(({ contract }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-muted p-4 rounded-md">
      <h3 className="font-medium mb-2">Document Information</h3>
      <div className="text-sm text-muted-foreground space-y-1">
        <p><span className="font-medium">File:</span> {contract.name}</p>
        <p><span className="font-medium">Size:</span> {formatFileSize(contract.file_size)}</p>
        <p><span className="font-medium">Uploaded:</span> {new Date(contract.upload_date).toLocaleDateString()}</p>
        <p><span className="font-medium">Status:</span> {contract.analysis_status}</p>
      </div>
    </div>
  );
});

DocumentInfo.displayName = 'DocumentInfo';

const OptimizedContractMainContent: React.FC<OptimizedContractMainContentProps> = ({
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
  // Memoize tabs configuration
  const tabs = useMemo(() => [
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'assistant', label: 'AI Assistant', icon: FileText }
  ], []);

  // Early returns for error and empty states
  if (!selectedContract) {
    return <EmptyState />;
  }

  if (error) {
    return (
      <ContractAnalysisErrorEnhanced 
        error={error} 
        onRetry={onRetryAnalysis}
      />
    );
  }

  // Show processing state for incomplete analysis
  if (selectedContract.analysis_status === 'processing') {
    return <ContractProcessingState stage="Analyzing contract content..." />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
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
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id}
                  role="tab"
                  aria-label={contractAriaLabelsEnhanced.analysisTab(tab.label, activeTab === tab.id)}
                  className="flex items-center gap-2"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4 mt-6">
              <Suspense fallback={<TabLoadingFallback />}>
                <DocumentInfo contract={selectedContract} />
                {selectedContract.content && (
                  <div className="bg-muted p-4 rounded-md max-h-60 overflow-y-auto">
                    <h3 className="font-medium mb-2">Content Preview</h3>
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedContract.content.substring(0, 500)}...
                    </p>
                  </div>
                )}
              </Suspense>
            </TabsContent>
            
            <TabsContent value="assistant" className="mt-6">
              <Suspense fallback={<TabLoadingFallback />}>
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
              {selectedContract.analysis_status === 'error' ? (
                <ContractAnalysisErrorEnhanced 
                  error="Error processing document" 
                  onRetry={onRetryAnalysis}
                />
              ) : (
                <MinimalLoadingSpinner text="Document analysis pending..." />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default memo(OptimizedContractMainContent);

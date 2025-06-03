
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ContractAnalysisHeader from '@/components/contract/ContractAnalysisHeader';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useRealContracts, Contract } from '@/hooks/contract/useRealContracts';
import { useContractActions } from '@/hooks/contract/useContractActions';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, FileText, Upload, Brain, MessageCircle } from 'lucide-react';
import RealContractUpload from '@/components/contract/RealContractUpload';
import ConversationHistory from '@/components/contract/tabs/components/ConversationHistory';

const ContractAnalysisPage: React.FC = () => {
  console.log('🏠 ContractAnalysisPage rendering...');
  
  const {
    contracts,
    selectedContract,
    loading,
    uploading,
    uploadProgress,
    error: contractsError,
    uploadContract,
    selectContract
  } = useRealContracts();

  const {
    questionHistory,
    isProcessing,
    handleAskQuestion,
    handleAnalyzeContract,
    handleRetryAnalysis
  } = useContractActions(selectedContract);

  // Local state for AI analysis and tabs
  const [activeTab, setActiveTab] = useState('summary');
  const [contractSummary, setContractSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [userQuestion, setUserQuestion] = useState('');
  
  console.log('📊 Contract page state:', {
    contractsCount: contracts.length,
    selectedContract: selectedContract ? {
      id: selectedContract.id,
      name: selectedContract.name,
      contentLength: selectedContract.content?.length || 0
    } : null,
    loading,
    uploading,
    error: contractsError,
    uploadProgress,
    activeTab,
    hasSummary: !!contractSummary,
    loadingSummary,
    summaryError
  });

  // Auto-generate summary when a contract is selected
  useEffect(() => {
    if (selectedContract && selectedContract.content && !contractSummary && !loadingSummary && !summaryError) {
      console.log('🔄 Auto-generating contract summary for:', selectedContract.id);
      generateContractSummary();
    }
  }, [selectedContract?.id]);

  // Reset summary when contract changes
  useEffect(() => {
    if (selectedContract?.id) {
      console.log('🔄 Contract changed, resetting summary state');
      setContractSummary(null);
      setSummaryError(null);
    }
  }, [selectedContract?.id]);

  // Generate contract summary using the enhanced contract assistant
  const generateContractSummary = async () => {
    if (!selectedContract?.content) {
      console.error('❌ No contract content available for summary');
      setSummaryError('No contract content available for analysis');
      return;
    }

    console.log('📝 Starting summary generation for contract:', {
      id: selectedContract.id,
      contentLength: selectedContract.content.length
    });

    setLoadingSummary(true);
    setSummaryError(null);
    setContractSummary(null);
    
    try {
      console.log('🤖 Calling handleAnalyzeContract with comprehensive_summary...');
      
      // Use the contract analysis function for summarization
      const result = await handleAnalyzeContract('comprehensive_summary');
      
      console.log('📥 Analysis result received:', {
        hasResult: !!result,
        hasAnalysis: !!(result?.analysis),
        analysisLength: result?.analysis?.length || 0
      });
      
      if (result && result.analysis) {
        console.log('✅ Setting contract summary:', result.analysis.substring(0, 100) + '...');
        setContractSummary(result.analysis);
        toast.success('Contract summary generated successfully!');
      } else {
        console.error('❌ No analysis content received:', result);
        throw new Error('No summary content received from AI analysis');
      }
    } catch (error) {
      console.error('❌ Error generating summary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate summary';
      setSummaryError(errorMessage);
      toast.error('Failed to generate contract summary', {
        description: errorMessage
      });
    } finally {
      setLoadingSummary(false);
    }
  };

  // Handle file upload
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🚀 File upload initiated');
    const file = e.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    try {
      console.log('📤 Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      const uploadedContract = await uploadContract(file);
      
      if (uploadedContract) {
        console.log('✅ Upload successful, resetting summary state');
        // Reset summary state for new contract
        setContractSummary(null);
        setSummaryError(null);
        setActiveTab('summary'); // Switch to summary tab
        toast.success('Contract uploaded and ready for analysis!');
      } else {
        console.error('❌ Upload failed: No contract returned');
        toast.error('Upload failed: No contract data received');
      }
    } catch (error) {
      console.error('❌ Upload failed with error:', error);
      toast.error('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }, [uploadContract]);

  // Handle Q&A submission
  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userQuestion.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (!selectedContract?.content) {
      toast.error('No contract available for questions');
      return;
    }

    try {
      console.log('❓ Submitting question:', userQuestion);
      const result = await handleAskQuestion(userQuestion);
      
      if (result) {
        setUserQuestion(''); // Clear input on success
        toast.success('Question answered successfully!');
      } else {
        toast.error('Failed to get answer from AI');
      }
    } catch (error) {
      console.error('❌ Error asking question:', error);
      toast.error('Failed to process question');
    }
  };

  // Render upload section when no contract is selected
  if (!selectedContract) {
    return (
      <AppLayout>
        <div className="container py-6 max-w-4xl">
          <ContractAnalysisHeader />
          
          <div className="mt-6">
            <ErrorBoundary>
              <RealContractUpload
                onFileUpload={handleFileUpload}
                isUploading={uploading}
                uploadProgress={uploadProgress}
                error={contractsError}
              />
            </ErrorBoundary>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Render tabbed analysis interface
  return (
    <AppLayout>
      <div className="container py-6 max-w-7xl">
        <ContractAnalysisHeader />
        
        <div className="mt-6 space-y-6">
          {/* Contract Header */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{selectedContract.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedContract.content?.length.toLocaleString()} characters • 
                      Uploaded {new Date(selectedContract.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => selectContract('')}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Tabbed Interface */}
          <Card className="min-h-[600px]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <CardHeader className="pb-3">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Summary
                  </TabsTrigger>
                  <TabsTrigger value="analysis" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Analysis
                  </TabsTrigger>
                  <TabsTrigger value="qa" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Ask Questions
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Summary Tab */}
                <TabsContent value="summary" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Contract Summary</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={generateContractSummary}
                        disabled={loadingSummary || isProcessing}
                      >
                        {loadingSummary || isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Brain className="h-4 w-4 mr-2" />
                        )}
                        {loadingSummary || isProcessing ? 'Generating...' : 'Regenerate Summary'}
                      </Button>
                    </div>

                    <ScrollArea className="h-[450px] w-full rounded-md border p-4">
                      {loadingSummary || isProcessing ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                            <p className="text-sm text-muted-foreground">
                              Analyzing contract and generating summary...
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Processing {selectedContract.content?.length || 0} characters of contract text
                            </p>
                          </div>
                        </div>
                      ) : summaryError ? (
                        <div className="text-center text-red-600">
                          <p className="mb-2">Failed to generate summary</p>
                          <p className="text-sm">{summaryError}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={generateContractSummary}
                            className="mt-4"
                          >
                            Try Again
                          </Button>
                        </div>
                      ) : contractSummary ? (
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {contractSummary}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <p>No summary available. Click "Regenerate Summary" to create one.</p>
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </TabsContent>

                {/* Analysis Tab */}
                <TabsContent value="analysis" className="mt-0">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Detailed Analysis</h3>
                    <ScrollArea className="h-[450px] w-full rounded-md border p-4">
                      <div className="space-y-4">
                        <Button 
                          variant="outline" 
                          onClick={() => handleAnalyzeContract('key_terms')}
                          disabled={isProcessing || loadingSummary}
                          className="w-full justify-start"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Analyze Key Terms
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          onClick={() => handleAnalyzeContract('risk_assessment')}
                          disabled={isProcessing || loadingSummary}
                          className="w-full justify-start"
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          Risk Assessment
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          onClick={() => handleAnalyzeContract('obligations')}
                          disabled={isProcessing || loadingSummary}
                          className="w-full justify-start"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Obligations & Responsibilities
                        </Button>

                        {questionHistory.filter(q => q.type === 'analysis').length > 0 && (
                          <div className="mt-6">
                            <h4 className="font-medium mb-3">Analysis Results</h4>
                            <ConversationHistory
                              questionHistory={questionHistory.filter(q => q.type === 'analysis')}
                              isProcessing={isProcessing}
                            />
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>

                {/* Q&A Tab */}
                <TabsContent value="qa" className="mt-0">
                  <div className="space-y-4 h-[500px] flex flex-col">
                    <h3 className="text-lg font-semibold">Ask Questions</h3>
                    
                    <ScrollArea className="flex-1 rounded-md border p-4">
                      <ConversationHistory
                        questionHistory={questionHistory.filter(q => q.type === 'question')}
                        isProcessing={isProcessing}
                      />
                    </ScrollArea>

                    <form onSubmit={handleQuestionSubmit} className="flex gap-2">
                      <Textarea
                        value={userQuestion}
                        onChange={(e) => setUserQuestion(e.target.value)}
                        placeholder="Ask a question about this contract..."
                        rows={3}
                        className="flex-1 resize-none"
                        disabled={isProcessing || loadingSummary}
                      />
                      <Button 
                        type="submit" 
                        disabled={!userQuestion.trim() || isProcessing || loadingSummary}
                        size="lg"
                      >
                        {isProcessing || loadingSummary ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          {/* Disclaimer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              This AI analysis is for informational purposes only and should not be considered legal advice. 
              Always consult with a qualified attorney for legal matters.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ContractAnalysisPage;

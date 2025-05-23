import React, { useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';
import ContractPageHeader from '@/components/contract/ContractPageHeader';
import ContractMainContent from '@/components/contract/ContractMainContent';
import RealContractUpload from '@/components/contract/RealContractUpload';
import EnhancedContractAssistantTab from '@/components/contract/tabs/EnhancedContractAssistantTab';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useRealContracts } from '@/hooks/contract/useRealContracts';
import { useRealContractQuestionAnswer } from '@/hooks/contract/useRealContractQuestionAnswer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const RealContractPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const { user } = useAuth();
  
  const {
    contracts,
    selectedContract,
    loading,
    uploading,
    uploadContract,
    selectContract
  } = useRealContracts();

  const questionAnswerState = useRealContractQuestionAnswer(selectedContract?.id || null);

  // Create a wrapper function that extracts the file from the event
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadContract(file);
      toast.success('Contract uploaded and analysis started');
      setActiveTab('assistant');
    }
  };

  const handleContractSelect = (contractId: string) => {
    selectContract(contractId);
    setActiveTab('assistant');
  };

  const handleAskQuestion = async (question: string) => {
    if (!selectedContract?.content) {
      throw new Error('No contract content available');
    }
    return await questionAnswerState.handleAskQuestion(question, selectedContract.content);
  };

  const handleAnalyzeContract = async (analysisType: string) => {
    if (!selectedContract?.content) {
      throw new Error('No contract content available');
    }
    return await questionAnswerState.handleAnalyzeContract(analysisType, selectedContract.content);
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="container py-6 max-w-5xl">
          <ContractPageHeader />
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Please log in to access contract analysis features.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-6 max-w-5xl">
        <ContractPageHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contract Selection and Upload */}
          <ErrorBoundary>
            <div className="space-y-6">
              <RealContractUpload 
                onFileUpload={handleFileUpload}
                uploading={uploading}
              />
              
              {/* Contract List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Contracts</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-muted-foreground">Loading contracts...</p>
                  ) : contracts.length === 0 ? (
                    <p className="text-muted-foreground">No contracts uploaded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {contracts.map((contract) => (
                        <Button
                          key={contract.id}
                          variant={selectedContract?.id === contract.id ? "default" : "outline"}
                          onClick={() => handleContractSelect(contract.id)}
                          className="w-full justify-start"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          <div className="text-left">
                            <div className="font-medium">{contract.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {contract.analysis_status === 'completed' ? 'Ready' : 
                               contract.analysis_status === 'processing' ? 'Processing...' :
                               contract.analysis_status === 'error' ? 'Error' : 'Pending'}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ErrorBoundary>
          
          {/* Main Column - Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <ErrorBoundary>
              {selectedContract ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Contract Analysis: {selectedContract.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedContract.analysis_status === 'completed' ? (
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                          <TabsTrigger value="summary">Summary</TabsTrigger>
                          <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="summary" className="space-y-4">
                          <div className="bg-muted p-4 rounded-md">
                            <h3 className="font-medium mb-2">Document Information</h3>
                            <p className="text-sm text-muted-foreground">
                              File: {selectedContract.name}<br/>
                              Size: {(selectedContract.file_size / 1024).toFixed(1)} KB<br/>
                              Uploaded: {new Date(selectedContract.upload_date).toLocaleDateString()}<br/>
                              Status: {selectedContract.analysis_status}
                            </p>
                          </div>
                          {selectedContract.content && (
                            <div className="bg-muted p-4 rounded-md max-h-60 overflow-y-auto">
                              <h3 className="font-medium mb-2">Content Preview</h3>
                              <p className="text-sm">{selectedContract.content.substring(0, 500)}...</p>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="assistant">
                          <EnhancedContractAssistantTab
                            onAskQuestion={handleAskQuestion}
                            onAnalyzeContract={handleAnalyzeContract}
                            questionHistory={questionAnswerState.questionHistory}
                            isProcessing={questionAnswerState.isProcessing}
                            contractText={selectedContract.content || ''}
                          />
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-muted-foreground">
                          {selectedContract.analysis_status === 'processing' 
                            ? 'Processing document...' 
                            : selectedContract.analysis_status === 'error'
                            ? 'Error processing document'
                            : 'Document analysis pending'
                          }
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Contract Selected</h3>
                    <p className="text-muted-foreground">
                      Upload a new contract or select an existing one to begin analysis.
                    </p>
                  </CardContent>
                </Card>
              )}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default RealContractPage;

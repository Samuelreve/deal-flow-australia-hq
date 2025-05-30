
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ContractAnalysisHeader from '@/components/contract/ContractAnalysisHeader';
import ContractSidebar from '@/components/contract/ContractSidebar';
import ContractAnalysisContent from '@/components/contract/ContractAnalysisContent';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useRealContracts } from '@/hooks/contract/useRealContracts';
import { useRealContractQuestionAnswerWithCache } from '@/hooks/contract/useRealContractQuestionAnswerWithCache';
import { toast } from 'sonner';

const ContractAnalysisPage: React.FC = () => {
  console.log('🏠 ContractAnalysisPage rendering...');
  
  // Initialize real contracts state
  const {
    contracts,
    selectedContract,
    loading,
    uploading,
    uploadProgress,
    error,
    uploadContract,
    selectContract
  } = useRealContracts();

  // Initialize question/answer state with the selected contract ID
  const questionAnswerState = useRealContractQuestionAnswerWithCache(selectedContract?.id || null);

  console.log('📊 Contract page state:', {
    contractsCount: contracts.length,
    selectedContract: selectedContract?.name,
    contractContent: selectedContract?.content?.length || 0,
    loading,
    uploading
  });

  // Handle file upload
  const handleFileUpload = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🚀 File upload initiated');
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      console.log('📤 Uploading file:', file.name);
      const uploadedContract = await uploadContract(file);
      
      if (uploadedContract) {
        console.log('✅ Upload successful, contract selected automatically');
        toast.success('Contract uploaded and ready for analysis!');
      }
    } catch (error) {
      console.error('❌ Upload failed:', error);
      toast.error('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }, [uploadContract]);

  // Handle contract selection
  const handleContractSelect = React.useCallback((contractId: string) => {
    console.log('📋 Selecting contract:', contractId);
    selectContract(contractId);
  }, [selectContract]);

  // Handle question submission
  const handleAskQuestion = React.useCallback(async (question: string) => {
    console.log('❓ Question asked:', question);
    
    if (!selectedContract?.content) {
      toast.error('No contract content available for analysis');
      return null;
    }

    return questionAnswerState.handleAskQuestion(question, selectedContract.content);
  }, [selectedContract, questionAnswerState]);

  // Handle contract analysis
  const handleAnalyzeContract = React.useCallback(async (analysisType: string) => {
    console.log('🔍 Analysis requested:', analysisType);
    
    if (!selectedContract?.content) {
      toast.error('No contract content available for analysis');
      return null;
    }

    return questionAnswerState.handleAnalyzeContract(analysisType, selectedContract.content);
  }, [selectedContract, questionAnswerState]);

  const handleRetryAnalysis = React.useCallback(() => {
    console.log('🔄 Retry analysis');
    questionAnswerState.invalidateCache();
  }, [questionAnswerState]);

  const exportHighlights = React.useCallback(() => {
    toast.info('Export functionality coming soon');
  }, []);

  // Helper function to map analysis status to DocumentMetadata status
  const mapAnalysisStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return 'completed' as const;
      case 'processing':
        return 'analyzing' as const;
      case 'failed':
        return 'error' as const;
      default:
        return 'pending' as const;
    }
  };

  return (
    <AppLayout>
      <div className="container py-6 max-w-7xl">
        <ContractAnalysisHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ErrorBoundary>
              <ContractSidebar
                documentMetadata={selectedContract ? {
                  id: selectedContract.id,
                  name: selectedContract.name,
                  type: selectedContract.mime_type,
                  uploadDate: selectedContract.upload_date,
                  status: mapAnalysisStatus(selectedContract.analysis_status),
                  version: '1.0',
                  versionDate: selectedContract.upload_date,
                  size: selectedContract.file_size,
                  category: 'contract'
                } : null}
                isAnalyzing={loading || uploading}
                documentHighlights={[]}
                onFileUpload={handleFileUpload}
                onExportHighlights={exportHighlights}
              />
            </ErrorBoundary>
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <ContractAnalysisContent
              documentMetadata={selectedContract ? {
                id: selectedContract.id,
                name: selectedContract.name,
                type: selectedContract.mime_type,
                uploadDate: selectedContract.upload_date,
                status: mapAnalysisStatus(selectedContract.analysis_status),
                version: '1.0',
                versionDate: selectedContract.upload_date,
                size: selectedContract.file_size,
                category: 'contract'
              } : null}
              contractText={selectedContract?.content || ''}
              error={error}
              isProcessing={questionAnswerState.isProcessing}
              questionHistory={questionAnswerState.questionHistory}
              onAskQuestion={handleAskQuestion}
              onAnalyzeContract={handleAnalyzeContract}
              onRetryAnalysis={handleRetryAnalysis}
              documentSummary={null}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ContractAnalysisPage;

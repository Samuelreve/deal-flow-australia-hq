
import React, { useCallback, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ContractAnalysisHeader from '@/components/contract/ContractAnalysisHeader';
import ContractSidebar from '@/components/contract/ContractSidebar';
import ContractAnalysisContent from '@/components/contract/ContractAnalysisContent';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useRealContracts } from '@/hooks/contract/useRealContracts';
import { useContractActions } from '@/hooks/contract/useContractActions';
import { toast } from 'sonner';

const ContractAnalysisPage: React.FC = () => {
  console.log('🏠 ContractAnalysisPage rendering...');
  
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

  const {
    questionHistory,
    isProcessing,
    handleAskQuestion,
    handleAnalyzeContract,
    handleRetryAnalysis
  } = useContractActions(selectedContract);

  console.log('📊 Contract page state:', {
    contractsCount: contracts.length,
    selectedContract: selectedContract ? {
      id: selectedContract.id,
      name: selectedContract.name,
      contentLength: selectedContract.content?.length || 0
    } : null,
    loading,
    uploading,
    error,
    uploadProgress
  });

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
        console.log('✅ Upload successful');
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

  // Handle contract selection
  const handleContractSelect = useCallback((contractId: string) => {
    console.log('📋 Selecting contract:', contractId);
    selectContract(contractId);
  }, [selectContract]);

  const exportHighlights = useCallback(() => {
    console.log('📊 Export highlights requested');
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

  // Create document metadata from selected contract
  const documentMetadata = React.useMemo(() => {
    if (!selectedContract) {
      console.log('📄 No selected contract, no document metadata');
      return null;
    }

    const metadata = {
      id: selectedContract.id,
      name: selectedContract.name,
      type: selectedContract.mime_type,
      uploadDate: selectedContract.upload_date,
      status: mapAnalysisStatus(selectedContract.analysis_status),
      version: '1.0',
      versionDate: selectedContract.upload_date,
      size: selectedContract.file_size,
      category: 'contract'
    };

    console.log('📄 Created document metadata:', metadata);
    return metadata;
  }, [selectedContract]);

  console.log('🎨 Rendering ContractAnalysisPage with:', {
    hasDocumentMetadata: !!documentMetadata,
    hasContractText: !!(selectedContract?.content),
    contractTextLength: selectedContract?.content?.length || 0,
    questionHistoryLength: questionHistory.length,
    isProcessing
  });

  return (
    <AppLayout>
      <div className="container py-6 max-w-7xl">
        <ContractAnalysisHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ErrorBoundary>
              <ContractSidebar
                documentMetadata={documentMetadata}
                isAnalyzing={loading || uploading}
                documentHighlights={[]}
                onFileUpload={handleFileUpload}
                onExportHighlights={exportHighlights}
              />
            </ErrorBoundary>
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <ContractAnalysisContent
              documentMetadata={documentMetadata}
              contractText={selectedContract?.content || ''}
              error={error}
              isProcessing={isProcessing}
              questionHistory={questionHistory}
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

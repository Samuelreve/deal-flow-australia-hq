
import React, { useState, useCallback } from 'react';
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
        console.log('✅ Upload successful, contract details:', {
          id: uploadedContract.id,
          name: uploadedContract.name,
          contentLength: uploadedContract.content?.length || 0
        });
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

  // Handle question submission - wrapper to transform return type
  const handleAskQuestion = useCallback(async (question: string) => {
    console.log('❓ Question asked:', question);
    
    if (!selectedContract?.content) {
      console.log('❌ No contract content available for analysis');
      toast.error('No contract content available for analysis');
      return null;
    }

    console.log('📝 Processing question with contract:', {
      contractId: selectedContract.id,
      contentLength: selectedContract.content.length,
      questionLength: question.length
    });

    const result = await questionAnswerState.handleAskQuestion(question, selectedContract.content);
    
    // Transform QuestionHistoryItem to expected format
    if (result) {
      console.log('✅ Question processed successfully');
      const answerText = typeof result.answer === 'string' 
        ? result.answer 
        : typeof result.answer === 'object' && result.answer !== null
        ? result.answer.answer
        : 'No response available';
      
      const sources = typeof result.answer === 'object' && result.answer !== null && result.answer.sources
        ? result.answer.sources
        : result.sources || [];

      return {
        answer: answerText,
        sources: sources
      };
    }
    
    console.log('❌ Question processing failed');
    return null;
  }, [selectedContract, questionAnswerState]);

  // Handle contract analysis - wrapper to transform return type
  const handleAnalyzeContract = useCallback(async (analysisType: string) => {
    console.log('🔍 Analysis requested:', analysisType);
    
    if (!selectedContract?.content) {
      console.log('❌ No contract content available for analysis');
      toast.error('No contract content available for analysis');
      return null;
    }

    console.log('📝 Processing analysis with contract:', {
      contractId: selectedContract.id,
      contentLength: selectedContract.content.length,
      analysisType
    });

    const result = await questionAnswerState.handleAnalyzeContract(analysisType, selectedContract.content);
    
    // Transform result to expected format
    if (result && result.content) {
      console.log('✅ Analysis completed successfully');
      return {
        analysis: result.content,
        sources: result.sources || []
      };
    }
    
    console.log('❌ Analysis failed');
    return null;
  }, [selectedContract, questionAnswerState]);

  const handleRetryAnalysis = useCallback(() => {
    console.log('🔄 Retry analysis');
    questionAnswerState.invalidateCache();
  }, [questionAnswerState]);

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
    questionHistoryLength: questionAnswerState.questionHistory.length,
    isProcessing: questionAnswerState.isProcessing
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

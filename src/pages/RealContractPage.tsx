
import React, { useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';
import ContractPageHeader from '@/components/contract/ContractPageHeader';
import ContractMobileHeader from '@/components/contract/mobile/ContractMobileHeader';
import ContractSidebarContent from '@/components/contract/layout/ContractSidebarContent';
import ContractMainContent from '@/components/contract/layout/ContractMainContent';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useRealContracts } from '@/hooks/contract/useRealContracts';
import { useRealContractQuestionAnswer } from '@/hooks/contract/useRealContractQuestionAnswer';
import { useAuth } from '@/contexts/AuthContext';
import { useContractKeyboardNavigation, useContractFocusManagement } from '@/components/contract/accessibility/ContractAccessibility';

const RealContractPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const { user } = useAuth();
  
  const {
    contracts,
    selectedContract,
    loading,
    uploading,
    uploadContract,
    selectContract,
    error: contractError
  } = useRealContracts();

  const questionAnswerState = useRealContractQuestionAnswer(selectedContract?.id || null);
  const { announceLiveRegion } = useContractFocusManagement();

  // Handle file upload with better UX
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadContract(file);
        toast.success('Contract uploaded successfully');
        announceLiveRegion('Contract uploaded and analysis started');
        setActiveTab('assistant');
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error('Failed to upload contract');
        announceLiveRegion('Contract upload failed');
      }
    }
  };

  const handleContractSelect = (contractId: string) => {
    selectContract(contractId);
    setActiveTab('assistant');
    announceLiveRegion('Contract selected');
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

  const handleRetryAnalysis = () => {
    if (selectedContract) {
      selectContract(selectedContract.id);
    }
  };

  // Keyboard navigation
  useContractKeyboardNavigation(
    () => document.getElementById('contract-upload-input')?.click(),
    () => {/* TODO: Save functionality */},
    () => {/* TODO: Search functionality */}
  );

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

  const sidebarContent = (
    <ContractSidebarContent
      contracts={contracts}
      selectedContract={selectedContract}
      loading={loading}
      uploading={uploading}
      onFileUpload={handleFileUpload}
      onContractSelect={handleContractSelect}
    />
  );

  return (
    <AppLayout>
      <div className="container py-6 max-w-7xl">
        <div className="hidden lg:block">
          <ContractPageHeader />
        </div>
        
        <ContractMobileHeader selectedContract={selectedContract}>
          {sidebarContent}
        </ContractMobileHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <ErrorBoundary>
              {sidebarContent}
            </ErrorBoundary>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <ErrorBoundary>
              <ContractMainContent
                selectedContract={selectedContract}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onAskQuestion={handleAskQuestion}
                onAnalyzeContract={handleAnalyzeContract}
                questionHistory={questionAnswerState.questionHistory}
                isProcessing={questionAnswerState.isProcessing}
                error={contractError}
                onRetryAnalysis={handleRetryAnalysis}
              />
            </ErrorBoundary>
          </div>
        </div>
        
        {/* Screen reader announcements */}
        <div 
          id="contract-announcements" 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        />
      </div>
    </AppLayout>
  );
};

export default RealContractPage;

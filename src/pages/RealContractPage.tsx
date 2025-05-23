
import React, { useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';
import ContractPageHeader from '@/components/contract/ContractPageHeader';
import ContractMobileHeader from '@/components/contract/mobile/ContractMobileHeader';
import ContractSidebarContent from '@/components/contract/layout/ContractSidebarContent';
import OptimizedContractMainContent from '@/components/contract/layout/OptimizedContractMainContent';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ContractSkipLinks, useContractKeyboardNavigation, useContractFocusManagement, useKeyboardHelp, ContractKeyboardHelp } from '@/components/contract/accessibility/EnhancedAccessibility';
import { useRealContracts } from '@/hooks/contract/useRealContracts';
import { useRealContractQuestionAnswerWithCache } from '@/hooks/contract/useRealContractQuestionAnswerWithCache';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from "@/hooks/use-mobile";
import { Spinner } from '@/components/ui/spinner';

const RealContractPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
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

  const questionAnswerState = useRealContractQuestionAnswerWithCache(selectedContract?.id || null);
  const { announceToScreenReader } = useContractFocusManagement();
  const { isOpen: isKeyboardHelpOpen, setIsOpen: setKeyboardHelpOpen } = useKeyboardHelp();

  // Handle file upload with enhanced UX
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadContract(file);
        toast.success('Contract uploaded successfully');
        announceToScreenReader(`Contract ${file.name} uploaded and analysis started`);
        setActiveTab('assistant');
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error('Failed to upload contract');
        announceToScreenReader('Contract upload failed');
      }
    }
  };

  const handleContractSelect = (contractId: string) => {
    selectContract(contractId);
    setActiveTab('assistant');
    announceToScreenReader('Contract selected and ready for analysis');
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
      // Invalidate cache for this contract before retrying
      questionAnswerState.invalidateCache();
      selectContract(selectedContract.id);
      announceToScreenReader('Retrying contract analysis');
    }
  };

  // Enhanced keyboard navigation
  useContractKeyboardNavigation(
    () => {
      document.getElementById('contract-upload-input')?.click();
      announceToScreenReader('Opening file upload dialog');
    },
    () => {
      // TODO: Save functionality
      announceToScreenReader('Save function not yet implemented');
    },
    () => {
      // TODO: Search functionality
      announceToScreenReader('Search function not yet implemented');
    },
    () => {
      setKeyboardHelpOpen(false);
    }
  );

  if (!user) {
    return (
      <AppLayout>
        <ContractSkipLinks />
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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading contracts...</p>
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
      uploadProgress={uploadProgress}
      onFileUpload={handleFileUpload}
      onContractSelect={handleContractSelect}
    />
  );

  return (
    <AppLayout>
      <ContractSkipLinks />
      
      <div className="container py-6 max-w-7xl">
        <div className="hidden lg:block">
          <ContractPageHeader />
        </div>
        
        <ContractMobileHeader selectedContract={selectedContract}>
          {sidebarContent}
        </ContractMobileHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Desktop Sidebar */}
          <div 
            id="contract-sidebar"
            className="hidden lg:block"
            tabIndex={-1}
          >
            <ErrorBoundary>
              {sidebarContent}
            </ErrorBoundary>
          </div>
          
          {/* Main Content */}
          <div 
            id="main-content"
            className="lg:col-span-2"
            tabIndex={-1}
          >
            <ErrorBoundary>
              <OptimizedContractMainContent
                selectedContract={selectedContract}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onAskQuestion={handleAskQuestion}
                onAnalyzeContract={handleAnalyzeContract}
                questionHistory={questionAnswerState.questionHistory}
                isProcessing={questionAnswerState.isProcessing}
                error={error}
                onRetryAnalysis={handleRetryAnalysis}
                isMobile={isMobile}
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

      {/* Keyboard help overlay */}
      <ContractKeyboardHelp 
        isOpen={isKeyboardHelpOpen}
        onClose={() => setKeyboardHelpOpen(false)}
      />
    </AppLayout>
  );
};

export default RealContractPage;

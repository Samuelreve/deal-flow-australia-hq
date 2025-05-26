
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from "@/hooks/use-mobile";
import { useContractPageHandlers } from './contract/hooks/useContractPageHandlers';
import ContractAccessibilityWrapper from './contract/components/ContractAccessibilityWrapper';
import ContractLoadingView from './contract/components/ContractLoadingView';
import ContractUnauthenticatedView from './contract/components/ContractUnauthenticatedView';
import ContractPageHeaderWrapper from './contract/components/ContractPageHeader';
import ContractMobileView from './contract/components/ContractMobileView';
import ContractSidebarWrapper from './contract/components/ContractSidebarWrapper';
import ContractMainWrapper from './contract/components/ContractMainWrapper';
import ContractSidebarContent from '@/components/contract/layout/ContractSidebarContent';

const RealContractPage: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const {
    activeTab,
    setActiveTab,
    contracts,
    selectedContract,
    loading,
    uploading,
    uploadProgress,
    error,
    questionHistory,
    isProcessing,
    handleFileUpload,
    handleContractSelect,
    handleAskQuestion,
    handleAnalyzeContract,
    handleRetryAnalysis
  } = useContractPageHandlers();

  if (!user) {
    return <ContractUnauthenticatedView />;
  }

  if (loading) {
    return <ContractLoadingView />;
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
      <ContractAccessibilityWrapper>
        <div className="container py-6 max-w-7xl">
          <div className="hidden lg:block">
            <ContractPageHeaderWrapper />
          </div>
          
          <ContractMobileView selectedContract={selectedContract}>
            {sidebarContent}
          </ContractMobileView>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Desktop Sidebar */}
            <ContractSidebarWrapper
              contracts={contracts}
              selectedContract={selectedContract}
              loading={loading}
              uploading={uploading}
              uploadProgress={uploadProgress}
              onFileUpload={handleFileUpload}
              onContractSelect={handleContractSelect}
            />
            
            {/* Main Content */}
            <ContractMainWrapper
              selectedContract={selectedContract}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onAskQuestion={handleAskQuestion}
              onAnalyzeContract={handleAnalyzeContract}
              questionHistory={questionHistory}
              isProcessing={isProcessing}
              error={error}
              onRetryAnalysis={handleRetryAnalysis}
              isMobile={isMobile}
            />
          </div>
        </div>
      </ContractAccessibilityWrapper>
    </AppLayout>
  );
};

export default RealContractPage;

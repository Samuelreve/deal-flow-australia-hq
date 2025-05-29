
import React from 'react';
import { useDocumentAI } from "@/hooks/useDocumentAI";
import ContractAssistantButton from './contract-assistant/ContractAssistantButton';
import SmartContractAssistantDialog from './contract-assistant/SmartContractAssistantDialog';
import { useSmartContractAssistantLogic } from './contract-assistant/SmartContractAssistantLogic';

interface SmartContractAssistantProps {
  dealId: string;
  documentId: string;
  versionId: string;
  userRole?: string;
  className?: string;
  selectedText?: string | null;
}

const SmartContractAssistant: React.FC<SmartContractAssistantProps> = ({
  dealId,
  documentId,
  versionId,
  userRole = 'user',
  className,
  selectedText
}) => {
  const {
    summarizeContract,
    explainContractClause,
    loading: isAnalyzing,
    error: aiError
  } = useDocumentAI({ dealId, documentId });

  const {
    isDialogOpen,
    activeTab,
    summaryResult,
    explanationResult,
    disclaimer,
    aiConnectionStatus,
    setActiveTab,
    setAiConnectionStatus,
    handleOpen,
    handleClose,
    handleSummarize,
    handleExplainClause
  } = useSmartContractAssistantLogic({
    dealId,
    documentId,
    versionId,
    selectedText,
    summarizeContract,
    explainContractClause,
    aiError
  });

  // Check if user role allows contract analysis
  const canAnalyzeContracts = ['admin', 'seller', 'buyer', 'lawyer'].includes(userRole.toLowerCase());
  
  if (!canAnalyzeContracts) {
    return null;
  }
  
  return (
    <>
      <ContractAssistantButton
        onClick={handleOpen}
        aiConnectionStatus={aiConnectionStatus}
        className={className}
      />
      
      <SmartContractAssistantDialog
        isOpen={isDialogOpen}
        onClose={handleClose}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        summaryResult={summaryResult}
        explanationResult={explanationResult}
        isAnalyzing={isAnalyzing}
        selectedText={selectedText}
        disclaimer={disclaimer}
        aiConnectionStatus={aiConnectionStatus}
        summarizeContract={summarizeContract}
        explainContractClause={explainContractClause}
        onSummarize={handleSummarize}
        onExplainClause={handleExplainClause}
      />
    </>
  );
};

export default SmartContractAssistant;

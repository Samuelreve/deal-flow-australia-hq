
import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAIToolsContext } from '@/hooks/useAIToolsContext';
import { useAITools } from '@/hooks/useAITools';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Import our newly created components
import AIToolMain from './AIToolMain';
import AIToolSelector from './AIToolSelector';
import DealSelectionTab from './DealSelectionTab';
import DocumentSelectionTab from './DocumentSelectionTab';
import AIResultDisplay from './AIResultDisplay';

interface AIToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIToolsModal: React.FC<AIToolsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const userId = user?.id || '';
  
  // State for tool selection and tabs
  const [activeOperation, setActiveOperation] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('deals');
  
  // Use our custom hooks
  const {
    deals,
    documents,
    loadingDeals,
    loadingDocs,
    selectedDealId,
    setSelectedDealId,
    selectedDocumentId,
    setSelectedDocumentId,
    selectedVersionId,
    setSelectedVersionId,
    clauseText,
    setClauseText
  } = useAIToolsContext(isOpen, userId);
  
  const {
    aiLoading,
    aiError,
    aiResult,
    runAI
  } = useAITools({ dealId: selectedDealId, documentId: selectedDocumentId });
  
  // Handle selecting an AI operation
  const handleSelectOperation = (operation: string) => {
    setActiveOperation(operation);
    setActiveTab('deals');
  };

  // Handle going back to the main menu
  const handleBackToMain = () => {
    setActiveOperation('');
    setActiveTab('deals');
  };

  // Handle selecting a deal
  const handleDealSelect = (dealId: string) => {
    setSelectedDealId(dealId);
    setSelectedDocumentId('');
    setSelectedVersionId('');
  };

  // Handle selecting a document
  const handleDocumentSelect = (docId: string, versionId: string) => {
    setSelectedDocumentId(docId);
    setSelectedVersionId(versionId);
  };

  // Handle running the AI operation
  const handleRunAI = async () => {
    const params: any = {
      dealId: selectedDealId,
      documentId: selectedDocumentId,
      versionId: selectedVersionId,
      clauseText
    };
    
    await runAI(activeOperation, params);
  };

  // Handle modal close
  const handleClose = () => {
    setActiveOperation('');
    setActiveTab('deals');
    onClose();
  };

  // Determine what content to render
  const renderContent = () => {
    // If no operation is selected, show the main tool selection
    if (!activeOperation) {
      return <AIToolMain onSelectTool={handleSelectOperation} />;
    }
    
    // If an operation is selected, show the tool interface
    return (
      <AIToolSelector 
        activeTab={activeTab} 
        activeOperation={activeOperation} 
        onBackClick={handleBackToMain} 
        onTabChange={setActiveTab}
      >
        <DealSelectionTab 
          deals={deals}
          loadingDeals={loadingDeals}
          selectedDealId={selectedDealId}
          onDealSelect={handleDealSelect}
          aiLoading={aiLoading}
          onRunAI={handleRunAI}
          activeOperation={activeOperation}
          activeTab={activeTab}
          onNextTab={() => setActiveTab('documents')}
        />
        
        <DocumentSelectionTab 
          documents={documents}
          loadingDocs={loadingDocs}
          selectedDealId={selectedDealId}
          selectedDocumentId={selectedDocumentId}
          onDocumentSelect={handleDocumentSelect}
          activeOperation={activeOperation}
          aiLoading={aiLoading}
          onRunAI={handleRunAI}
          clauseText={clauseText}
          onClauseTextChange={setClauseText}
        />
        
        <AIResultDisplay 
          result={aiResult}
          disclaimer={aiResult?.disclaimer || ''}
          error={aiError}
        />
      </AIToolSelector>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Assistant
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-1">
          {renderContent()}
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIToolsModal;

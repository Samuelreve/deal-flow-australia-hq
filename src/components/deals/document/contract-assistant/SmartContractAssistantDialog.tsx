
import React from 'react';
import { Brain, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SummaryTab from './SummaryTab';
import ExplanationTab from './ExplanationTab';
import DisclaimerAlert from './DisclaimerAlert';
import AIConnectionManager from './AIConnectionManager';

interface SmartContractAssistantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  summaryResult: any;
  explanationResult: any;
  isAnalyzing: boolean;
  selectedText: string | null;
  disclaimer: string;
  aiConnectionStatus: 'checking' | 'connected' | 'error';
  summarizeContract: any;
  explainContractClause: any;
  onSummarize: () => void;
  onExplainClause: () => void;
}

const SmartContractAssistantDialog: React.FC<SmartContractAssistantDialogProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  summaryResult,
  explanationResult,
  isAnalyzing,
  selectedText,
  disclaimer,
  aiConnectionStatus,
  summarizeContract,
  explainContractClause,
  onSummarize,
  onExplainClause
}) => {
  const handleClose = () => {
    onClose();
  };

  if (aiConnectionStatus === 'error') {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Smart Contract Assistant
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">AI Services Unavailable</h3>
            <p className="text-red-700 mb-4">
              The AI services are currently unavailable. Please check your connection and try again.
            </p>
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Smart Contract Assistant
            <AIConnectionManager
              summarizeContract={summarizeContract}
              explainContractClause={explainContractClause}
              onStatusChange={() => {}}
            />
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger 
              value="summary" 
              onClick={onSummarize}
              className="flex items-center gap-2"
            >
              Contract Summary
            </TabsTrigger>
            <TabsTrigger 
              value="explanation" 
              onClick={onExplainClause}
              disabled={!selectedText}
              className="flex items-center gap-2"
            >
              Explain Selected Clause
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            <SummaryTab 
              summaryResult={summaryResult} 
              isAnalyzing={isAnalyzing} 
            />
          </TabsContent>
          
          <TabsContent value="explanation">
            <ExplanationTab 
              explanationResult={explanationResult} 
              isAnalyzing={isAnalyzing} 
              selectedText={selectedText} 
            />
          </TabsContent>
        </Tabs>
        
        <DisclaimerAlert disclaimer={disclaimer} />
      </DialogContent>
    </Dialog>
  );
};

export default SmartContractAssistantDialog;

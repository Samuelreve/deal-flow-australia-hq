
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDocumentAI } from "@/hooks/document-ai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from 'react-router-dom';
import SummaryTab from './contract-assistant/SummaryTab';
import ExplanationTab from './contract-assistant/ExplanationTab';
import DisclaimerAlert from './contract-assistant/DisclaimerAlert';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [summaryResult, setSummaryResult] = useState<any>(null);
  const [explanationResult, setExplanationResult] = useState<any>(null);
  const [disclaimer, setDisclaimer] = useState<string>('');
  const location = useLocation();
  
  const {
    summarizeContract,
    explainContractClause,
    loading: isAnalyzing,
  } = useDocumentAI({ dealId, documentId });

  // Check URL search params for auto-analysis flag
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const shouldAnalyze = searchParams.get('analyze') === 'true';
    const docId = searchParams.get('docId');
    const versionId = searchParams.get('versionId');
    
    if (shouldAnalyze && docId === documentId && versionId) {
      // Auto-open the dialog and start analysis
      setIsDialogOpen(true);
      handleSummarize();
    }
  }, [location.search, documentId]);

  // Check if user role allows contract analysis
  const canAnalyzeContracts = ['admin', 'seller', 'buyer', 'lawyer'].includes(userRole.toLowerCase());
  
  if (!canAnalyzeContracts) {
    return null;
  }
  
  const handleSummarize = async () => {
    setActiveTab("summary");
    
    try {
      const result = await summarizeContract(documentId, versionId);
      
      if (result) {
        setSummaryResult(result);
        setDisclaimer(result.disclaimer);
      }
    } catch (error) {
      console.error('Contract summarization failed:', error);
    }
  };
  
  const handleExplainClause = async () => {
    if (!selectedText) {
      return;
    }
    
    setActiveTab("explanation");
    
    try {
      const result = await explainContractClause(selectedText, documentId, versionId);
      
      if (result) {
        setExplanationResult(result);
        setDisclaimer(result.disclaimer);
      }
    } catch (error) {
      console.error('Clause explanation failed:', error);
    }
  };
  
  const handleOpen = () => {
    setIsDialogOpen(true);
    handleSummarize();
  };
  
  const handleClose = () => {
    setIsDialogOpen(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setSummaryResult(null);
      setExplanationResult(null);
    }, 300);
  };
  
  return (
    <>
      <Button 
        variant="outline"
        onClick={handleOpen}
        className={`gap-2 ${className || ''}`}
        size="sm"
      >
        <FileText className="h-4 w-4" />
        Contract Assistant
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Smart Contract Assistant</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="summary" onClick={handleSummarize}>Contract Summary</TabsTrigger>
              <TabsTrigger value="explanation" 
                onClick={handleExplainClause}
                disabled={!selectedText}>
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
    </>
  );
};

export default SmartContractAssistant;

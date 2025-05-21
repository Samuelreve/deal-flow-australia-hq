
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDocumentAI } from "@/hooks/useDocumentAI";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from 'react-router-dom';
import { toast } from "sonner";
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
    error: aiError
  } = useDocumentAI({ dealId, documentId });

  // Check URL search params for auto-analysis flag
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const shouldAnalyze = searchParams.get('analyze') === 'true';
    const docId = searchParams.get('docId');
    const verId = searchParams.get('versionId');
    
    if (shouldAnalyze && docId === documentId && verId) {
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
    setSummaryResult(null); // Clear previous result
    
    try {
      const result = await summarizeContract(documentId, versionId);
      
      if (result) {
        setSummaryResult(result);
        setDisclaimer(result.disclaimer);
        return;
      }
      
      if (aiError) {
        toast.error("Failed to summarize contract", {
          description: aiError
        });
      }
    } catch (error) {
      console.error('Contract summarization failed:', error);
      toast.error("Contract summarization failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    }
  };
  
  const handleExplainClause = async () => {
    if (!selectedText) {
      toast.error("No text selected", {
        description: "Please select a clause from the contract to get an explanation."
      });
      return;
    }
    
    setActiveTab("explanation");
    setExplanationResult(null); // Clear previous result
    
    try {
      const result = await explainContractClause(selectedText, documentId, versionId);
      
      if (result) {
        setExplanationResult(result);
        setDisclaimer(result.disclaimer);
        return;
      }
      
      if (aiError) {
        toast.error("Failed to explain clause", {
          description: aiError
        });
      }
    } catch (error) {
      console.error('Clause explanation failed:', error);
      toast.error("Clause explanation failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    }
  };
  
  const handleOpen = () => {
    setIsDialogOpen(true);
    if (!summaryResult) {
      handleSummarize();
    }
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

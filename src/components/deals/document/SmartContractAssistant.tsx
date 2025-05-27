
import React, { useState, useEffect } from 'react';
import { Brain, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDocumentAI } from "@/hooks/useDocumentAI";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from 'react-router-dom';
import { toast } from "sonner";
import SummaryTab from './contract-assistant/SummaryTab';
import ExplanationTab from './contract-assistant/ExplanationTab';
import DisclaimerAlert from './contract-assistant/DisclaimerAlert';
import AIConnectionManager from './contract-assistant/AIConnectionManager';
import ContractAssistantButton from './contract-assistant/ContractAssistantButton';

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
  const [aiConnectionStatus, setAiConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
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
      setIsDialogOpen(true);
      handleSummarize();
      toast.success("AI Analysis Started", {
        description: "Smart Contract Assistant is analyzing your document..."
      });
    }
  }, [location.search, documentId]);

  // Check if user role allows contract analysis
  const canAnalyzeContracts = ['admin', 'seller', 'buyer', 'lawyer'].includes(userRole.toLowerCase());
  
  if (!canAnalyzeContracts) {
    return null;
  }
  
  const handleSummarize = async () => {
    setActiveTab("summary");
    setSummaryResult(null);
    
    try {
      console.log('📋 Starting contract summarization...');
      const result = await summarizeContract(documentId, versionId);
      
      if (result) {
        console.log('✅ Contract summarization completed');
        setSummaryResult(result);
        setDisclaimer(result.disclaimer);
        toast.success("Contract Summary Complete", {
          description: "AI has successfully analyzed your contract"
        });
        return;
      }
      
      throw new Error(aiError || 'Failed to generate summary');
    } catch (error) {
      console.error('❌ Contract summarization failed:', error);
      toast.error("Summary Failed", {
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
    setExplanationResult(null);
    
    try {
      console.log('🔍 Starting clause explanation...');
      const result = await explainContractClause(selectedText, documentId, versionId);
      
      if (result) {
        console.log('✅ Clause explanation completed');
        setExplanationResult(result);
        setDisclaimer(result.disclaimer);
        toast.success("Clause Explanation Complete", {
          description: "AI has explained the selected clause"
        });
        return;
      }
      
      throw new Error(aiError || 'Failed to explain clause');
    } catch (error) {
      console.error('❌ Clause explanation failed:', error);
      toast.error("Explanation Failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    }
  };
  
  const handleOpen = () => {
    setIsDialogOpen(true);
    if (!summaryResult && aiConnectionStatus === 'connected') {
      handleSummarize();
    }
  };
  
  const handleClose = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setSummaryResult(null);
      setExplanationResult(null);
    }, 300);
  };
  
  return (
    <>
      <ContractAssistantButton
        onClick={handleOpen}
        aiConnectionStatus={aiConnectionStatus}
        className={className}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Smart Contract Assistant
              <AIConnectionManager
                summarizeContract={summarizeContract}
                explainContractClause={explainContractClause}
                onStatusChange={setAiConnectionStatus}
              />
            </DialogTitle>
          </DialogHeader>
          
          {aiConnectionStatus === 'error' ? (
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
          ) : (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger 
                    value="summary" 
                    onClick={handleSummarize}
                    className="flex items-center gap-2"
                  >
                    Contract Summary
                  </TabsTrigger>
                  <TabsTrigger 
                    value="explanation" 
                    onClick={handleExplainClause}
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SmartContractAssistant;

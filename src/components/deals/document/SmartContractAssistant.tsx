
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Brain, Loader2, CheckCircle, AlertCircle } from "lucide-react";
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
  const [aiConnectionStatus, setAiConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const location = useLocation();
  
  const {
    summarizeContract,
    explainContractClause,
    loading: isAnalyzing,
    error: aiError
  } = useDocumentAI({ dealId, documentId });

  // Test AI connection when component mounts
  useEffect(() => {
    const testAIConnection = async () => {
      try {
        // Simple test to verify AI is working
        setAiConnectionStatus('checking');
        
        // The hooks should be available if AI is properly configured
        if (summarizeContract && explainContractClause) {
          setAiConnectionStatus('connected');
          console.log('✅ Smart Contract Assistant: AI services connected successfully');
        } else {
          throw new Error('AI services not available');
        }
      } catch (error) {
        console.error('❌ Smart Contract Assistant: AI connection failed', error);
        setAiConnectionStatus('error');
      }
    };

    testAIConnection();
  }, [summarizeContract, explainContractClause]);

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
    setSummaryResult(null); // Clear previous result
    
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
    setExplanationResult(null); // Clear previous result
    
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
    // Reset state after dialog closes
    setTimeout(() => {
      setSummaryResult(null);
      setExplanationResult(null);
    }, 300);
  };

  const getConnectionStatusIcon = () => {
    switch (aiConnectionStatus) {
      case 'checking':
        return <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />;
      case 'connected':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (aiConnectionStatus) {
      case 'checking':
        return 'Connecting to AI...';
      case 'connected':
        return 'AI Ready';
      case 'error':
        return 'AI Unavailable';
    }
  };
  
  return (
    <>
      <Button 
        variant="outline"
        onClick={handleOpen}
        className={`gap-2 ${className || ''}`}
        size="sm"
        disabled={aiConnectionStatus === 'error'}
      >
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <span>Contract Assistant</span>
          {getConnectionStatusIcon()}
        </div>
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Smart Contract Assistant
              <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                {getConnectionStatusIcon()}
                <span>{getConnectionStatusText()}</span>
              </div>
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
                    <FileText className="h-4 w-4" />
                    Contract Summary
                  </TabsTrigger>
                  <TabsTrigger 
                    value="explanation" 
                    onClick={handleExplainClause}
                    disabled={!selectedText}
                    className="flex items-center gap-2"
                  >
                    <Brain className="h-4 w-4" />
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

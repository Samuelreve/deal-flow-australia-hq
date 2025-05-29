
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from "sonner";

interface UseSmartContractAssistantLogicProps {
  dealId: string;
  documentId: string;
  versionId: string;
  selectedText?: string | null;
  summarizeContract: any;
  explainContractClause: any;
  aiError: string | null;
}

export const useSmartContractAssistantLogic = ({
  dealId,
  documentId,
  versionId,
  selectedText,
  summarizeContract,
  explainContractClause,
  aiError
}: UseSmartContractAssistantLogicProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [summaryResult, setSummaryResult] = useState<any>(null);
  const [explanationResult, setExplanationResult] = useState<any>(null);
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [aiConnectionStatus, setAiConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const location = useLocation();

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

  return {
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
  };
};

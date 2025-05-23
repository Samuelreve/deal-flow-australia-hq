
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import DocumentAnalysisTypeSelector from "./DocumentAnalysisTypeSelector";
import DocumentAnalysisHistory from "./DocumentAnalysisHistory";
import { useDocumentAI } from "@/hooks/document-ai";
import { useDocumentAnalysisHistory } from "@/hooks/document-ai/useDocumentAnalysisHistory";
import AnalyzerHeader from './analyzer/AnalyzerHeader';
import AnalyzerTabsNav from './analyzer/AnalyzerTabsNav';
import ResultPanel from './analyzer/ResultPanel';

interface EnhancedDocumentAnalyzerProps {
  dealId: string;
  documentId: string;
  versionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole?: string;
}

const EnhancedDocumentAnalyzer: React.FC<EnhancedDocumentAnalyzerProps> = ({
  dealId,
  documentId,
  versionId,
  open,
  onOpenChange,
  userRole = 'user'
}) => {
  const [activeTab, setActiveTab] = useState<string>("analyze");
  const [analysisType, setAnalysisType] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [disclaimer, setDisclaimer] = useState<string>('');
  
  // Document AI hook for analysis operations
  const {
    analyzeDocument,
    summarizeContract,
    loading: isAnalyzing,
    saveAnalysisResult
  } = useDocumentAI({ dealId, documentId });
  
  // Document analysis history hook
  const {
    analyses,
    loading: loadingHistory,
    loadVersionAnalysisHistory,
    selectedAnalysis,
    setSelectedAnalysis
  } = useDocumentAnalysisHistory({ documentId, documentVersionId: versionId });
  
  // Load analysis history when the component mounts or versionId changes
  useEffect(() => {
    if (open && versionId) {
      loadVersionAnalysisHistory(versionId);
    }
  }, [open, versionId, loadVersionAnalysisHistory]);

  // Function to handle analysis type selection
  const handleAnalysisTypeSelect = async (type: string) => {
    setAnalysisType(type);
    setAnalysisResult(null);
    setDisclaimer('');
    setActiveTab("result");
    
    try {
      // Handle different analysis types
      if (type === 'summarize_contract') {
        const result = await summarizeContract(documentId, versionId, true);
        if (result) {
          setAnalysisResult({ type: 'summary', content: { summary: result.summary } });
          setDisclaimer(result.disclaimer || '');
        }
      } else {
        const result = await analyzeDocument(documentId, versionId, type, true);
        if (result) {
          setAnalysisResult(result.analysis);
          setDisclaimer(result.disclaimer || '');
        }
      }
    } catch (error) {
      console.error('Document analysis failed:', error);
    }
  };
  
  // Function to handle selecting an analysis from history
  const handleSelectAnalysis = (analysis: any) => {
    setSelectedAnalysis(analysis);
    setAnalysisType(analysis.analysisType);
    setAnalysisResult({
      type: analysis.analysisType,
      content: analysis.analysisContent
    });
    setActiveTab('result');
  };
  
  // Function to explicitly save the current analysis
  const handleSaveAnalysis = async () => {
    if (!analysisResult || !analysisType) return;
    
    try {
      await saveAnalysisResult(
        analysisType, 
        analysisResult.content || analysisResult, 
        documentId, 
        versionId
      );
      
      // Refresh the history
      loadVersionAnalysisHistory(versionId);
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving analysis:', error);
      return Promise.reject(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <AnalyzerHeader />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <AnalyzerTabsNav hasResult={!!analysisResult} />
          
          <TabsContent value="analyze" className="pt-4">
            <DocumentAnalysisTypeSelector 
              onSelect={handleAnalysisTypeSelect}
              isAnalyzing={isAnalyzing}
            />
          </TabsContent>
          
          <TabsContent value="history" className="pt-4">
            <DocumentAnalysisHistory 
              analyses={analyses}
              loading={loadingHistory}
              onSelectAnalysis={handleSelectAnalysis}
              selectedAnalysisId={selectedAnalysis?.id}
            />
          </TabsContent>
          
          <TabsContent value="result" className="pt-4">
            <ResultPanel 
              analysisResult={analysisResult}
              analysisType={analysisType}
              disclaimer={disclaimer}
              isAnalyzing={isAnalyzing}
              onBackClick={() => setActiveTab("analyze")}
              onSaveAnalysis={handleSaveAnalysis}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedDocumentAnalyzer;

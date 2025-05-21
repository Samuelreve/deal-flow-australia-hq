
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentAnalysisTypeSelector from "./DocumentAnalysisTypeSelector";
import DocumentAnalysisResults from "./DocumentAnalysisResults";
import DocumentAnalysisHistory from "./DocumentAnalysisHistory";
import { useDocumentAI } from "@/hooks/document-ai";
import { useDocumentAnalysisHistory } from "@/hooks/document-ai/useDocumentAnalysisHistory";
import { Button } from "@/components/ui/button";
import { History, Loader2, Save } from "lucide-react";

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
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  
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
  }, [open, versionId]);

  // Function to handle analysis type selection
  const handleAnalysisTypeSelect = async (type: string) => {
    setAnalysisType(type);
    setAnalysisResult(null);
    setDisclaimer('');
    
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
      
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 3000);
      
      // Refresh the history
      loadVersionAnalysisHistory(versionId);
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Document Analysis</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList>
            <TabsTrigger value="analyze">New Analysis</TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-1" />
              History
            </TabsTrigger>
            {analysisResult && <TabsTrigger value="result">Current Result</TabsTrigger>}
          </TabsList>
          
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
            {analysisResult ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Analysis Results</h3>
                  <div className="flex items-center gap-2">
                    {showSavedMessage && (
                      <span className="text-green-600 text-sm animate-in fade-in">
                        Saved successfully!
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveAnalysis}
                      className="flex items-center gap-1"
                    >
                      <Save className="h-4 w-4" />
                      Save Analysis
                    </Button>
                  </div>
                </div>
                
                <DocumentAnalysisResults 
                  analysisType={analysisType}
                  result={analysisResult}
                  disclaimer={disclaimer}
                  onBack={() => setActiveTab("analyze")}
                />
              </div>
            ) : isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Analyzing document...</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No analysis results available. Please start a new analysis or select one from history.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedDocumentAnalyzer;

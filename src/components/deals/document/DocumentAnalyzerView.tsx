
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { useDocumentAnalysis } from '@/hooks/document-analysis';
import DocumentAnalysisTypeGrid from './analyzer/DocumentAnalysisTypeGrid';
import AnalysisContent from './analyzer/AnalysisContent';
import DocumentAnalysisProgressBar from './analyzer/DocumentAnalysisProgressBar';
import DisclaimerFooter from './analyzer/DisclaimerFooter';

interface DocumentAnalyzerViewProps {
  dealId: string;
  documentId: string;
  versionId: string;
  onClose: () => void;
}

const DocumentAnalyzerView: React.FC<DocumentAnalyzerViewProps> = ({
  dealId,
  documentId,
  versionId,
  onClose
}) => {
  const { toast } = useToast();
  
  const {
    // Analysis types
    analysisTypes,
    
    // Execution
    runAnalysis,
    currentAnalysis,
    analysisProgress,
    analysisResults,
    isAnalyzing,
    analysisError,
    getAnalysisResult,
    
    // History
    history,
    loadHistory
  } = useDocumentAnalysis({ dealId, documentId, versionId });

  // Load analysis history on mount
  useEffect(() => {
    if (documentId && versionId) {
      loadHistory(documentId, versionId);
    }
  }, [documentId, versionId, loadHistory]);

  // Auto-run contract summary on mount
  useEffect(() => {
    if (!getAnalysisResult('summarize_contract') && !isAnalyzing) {
      runAnalysis('summarize_contract');
    }
  }, []);

  const handleAnalysisSelect = async (analysisType: string) => {
    try {
      await runAnalysis(analysisType);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  const completedAnalyses = Object.keys(analysisResults).filter(
    type => analysisResults[type]?.success
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Document Analysis</CardTitle>
          <CardDescription>AI-powered document analysis and insights</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analysis Progress */}
        {analysisProgress && (
          <DocumentAnalysisProgressBar progress={analysisProgress} />
        )}
        
        {/* Analysis Type Selection */}
        {!isAnalyzing && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Choose Analysis Type</h3>
            <DocumentAnalysisTypeGrid
              analysisTypes={analysisTypes}
              onSelect={handleAnalysisSelect}
              isAnalyzing={isAnalyzing}
              currentAnalysis={currentAnalysis}
              completedAnalyses={completedAnalyses}
            />
          </div>
        )}
        
        {/* Results Display */}
        {completedAnalyses.length > 0 && !isAnalyzing && (
          <Tabs defaultValue={completedAnalyses[0]} className="w-full">
            <div className="flex flex-wrap gap-2 mb-4">
              {completedAnalyses.map(type => {
                const analysisType = analysisTypes.find(at => at.id === type);
                return (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Switch to this tab's content
                      const result = getAnalysisResult(type);
                      if (result) {
                        // This could be enhanced to show the result in a modal or expanded view
                      }
                    }}
                  >
                    {analysisType?.label || type}
                  </Button>
                );
              })}
            </div>
            
            {completedAnalyses.map(type => {
              const result = getAnalysisResult(type);
              return (
                <TabsContent key={type} value={type} className="pt-2">
                  <AnalysisContent 
                    analysisType={type}
                    result={result?.content}
                    loading={false}
                    inProgress={false}
                  />
                  <DisclaimerFooter result={result} />
                </TabsContent>
              );
            })}
          </Tabs>
        )}
        
        {/* Error Display */}
        {analysisError && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{analysisError}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentAnalyzerView;

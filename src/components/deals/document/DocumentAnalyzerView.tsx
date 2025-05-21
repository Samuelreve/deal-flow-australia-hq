
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { ANALYSIS_TYPES } from './analyzer/constants';
import { useAnalysisState } from './analyzer/useAnalysisState';
import AnalysisTypeList from './analyzer/AnalysisTypeList';
import AnalysisContent from './analyzer/AnalysisContent';
import AnalysisProgress from './analyzer/AnalysisProgress';
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
    activeTab,
    analysisResults,
    analysisInProgress,
    analysisProgress,
    analysisStartTime,
    aiLoading,
    aiError,
    runAnalysis,
    handleTabChange,
  } = useAnalysisState(dealId, documentId, versionId);

  // Run initial contract summary when component mounts
  useEffect(() => {
    runAnalysis('summarize_contract');
  }, [documentId, versionId]);

  const renderAnalysisContent = (analysisType: string) => {
    const result = analysisResults[analysisType];
    const loading = analysisInProgress === analysisType || (aiLoading && !result);
    
    if (loading) {
      return <AnalysisProgress progress={analysisProgress} startTime={analysisStartTime} />;
    }
    
    return <AnalysisContent 
      analysisType={analysisType} 
      result={result} 
      loading={aiLoading} 
      inProgress={analysisInProgress === analysisType} 
    />;
  };

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
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <AnalysisTypeList 
            analysisTypes={ANALYSIS_TYPES}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            analysisInProgress={analysisInProgress}
          />
          
          {ANALYSIS_TYPES.map(type => (
            <TabsContent key={type.id} value={type.id} className="pt-2">
              {renderAnalysisContent(type.id)}
              <DisclaimerFooter result={analysisResults[type.id]} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentAnalyzerView;

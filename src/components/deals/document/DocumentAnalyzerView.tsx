
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocumentAI } from '@/hooks/document-ai';
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, Loader2, X, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from '@/components/ui/use-toast';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface DocumentAnalysisContent {
  type: string;
  content: any;
}

interface DocumentAnalyzerViewProps {
  dealId: string;
  documentId: string;
  versionId: string;
  onClose: () => void;
}

const ANALYSIS_TYPES = [
  { id: 'summarize_contract', label: 'Contract Summary', icon: <FileText className="h-4 w-4" /> },
  { id: 'key_clauses', label: 'Key Clauses', description: 'Extract important clauses from the document' },
  { id: 'risk_identification', label: 'Risk Analysis', description: 'Identify potential risks in the document' },
  { id: 'legal_compliance', label: 'Legal Compliance', description: 'Check for compliance considerations' },
  { id: 'obligations_analysis', label: 'Obligations', description: 'Extract obligations and commitments' },
];

const DocumentAnalyzerView: React.FC<DocumentAnalyzerViewProps> = ({
  dealId,
  documentId,
  versionId,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('summarize_contract');
  const [analysisResults, setAnalysisResults] = useState<Record<string, DocumentAnalysisContent>>({});
  const [analysisInProgress, setAnalysisInProgress] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisStartTime, setAnalysisStartTime] = useState<Date | null>(null);
  const { toast } = useToast();
  
  // Initialize document AI hook
  const {
    analyzeDocument,
    summarizeContract,
    loading: aiLoading,
    error: aiError
  } = useDocumentAI({ dealId, documentId });

  // Run initial contract summary when component mounts
  useEffect(() => {
    runAnalysis('summarize_contract');
  }, [documentId, versionId]);

  // Simulate progress updates during analysis
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;
    
    if (analysisInProgress) {
      setAnalysisProgress(0);
      setAnalysisStartTime(new Date());
      
      progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          // Gradually increase progress but never reach 100% until analysis is complete
          const newProgress = prev + (100 - prev) * 0.1;
          return Math.min(newProgress, 95);
        });
      }, 500);
    } else if (analysisProgress > 0 && analysisProgress < 100) {
      // Set to 100% when analysis is complete
      setAnalysisProgress(100);
      
      // Reset progress after a delay
      const resetTimeout = setTimeout(() => {
        setAnalysisProgress(0);
      }, 1000);
      
      return () => clearTimeout(resetTimeout);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [analysisInProgress, analysisProgress]);

  const runAnalysis = async (analysisType: string) => {
    if (analysisInProgress || analysisResults[analysisType]) return;
    
    setAnalysisInProgress(analysisType);
    
    try {
      let result;
      if (analysisType === 'summarize_contract') {
        result = await summarizeContract(documentId, versionId);
        if (result) {
          setAnalysisResults(prev => ({
            ...prev,
            [analysisType]: {
              type: analysisType,
              content: { summary: result.summary }
            }
          }));
        }
      } else {
        result = await analyzeDocument(documentId, versionId, analysisType);
        if (result) {
          setAnalysisResults(prev => ({
            ...prev,
            [analysisType]: result.analysis
          }));
        }
      }
    } catch (error) {
      console.error(`Error running ${analysisType} analysis:`, error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: `Failed to run ${getAnalysisLabel(analysisType)} analysis.`
      });
    } finally {
      setAnalysisInProgress(null);
    }
  };

  const getAnalysisLabel = (analysisType: string): string => {
    const found = ANALYSIS_TYPES.find(type => type.id === analysisType);
    return found ? found.label : 'Analysis';
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (!analysisResults[value]) {
      runAnalysis(value);
    }
  };

  const getAnalysisTime = () => {
    if (!analysisStartTime || !analysisInProgress) return null;
    
    const elapsedMs = new Date().getTime() - analysisStartTime.getTime();
    const seconds = Math.floor(elapsedMs / 1000);
    return `${seconds}s`;
  };

  const renderAnalysisContent = (analysisType: string) => {
    const result = analysisResults[analysisType];
    const loading = analysisInProgress === analysisType || (aiLoading && !result);
    
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground mb-2">Analyzing document...</p>
          {analysisProgress > 0 && (
            <div className="w-full max-w-xs">
              <Progress value={analysisProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {getAnalysisTime() ? `Analysis time: ${getAnalysisTime()}` : 'Initializing analysis'}
              </p>
            </div>
          )}
        </div>
      );
    }
    
    if (!result) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Analysis not available. Please try again.</p>
        </div>
      );
    }
    
    switch (analysisType) {
      case 'summarize_contract':
        return (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{result.content.summary}</p>
          </div>
        );
        
      case 'key_clauses':
        return (
          <div className="space-y-4">
            {Array.isArray(result.content) ? result.content.map((clause, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    {clause.heading}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 pt-0">
                  <p className="text-sm text-muted-foreground">{clause.summary}</p>
                  {clause.location && (
                    <Badge variant="outline" className="mt-2">
                      Page {clause.location}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )) : (
              <p>No key clauses identified.</p>
            )}
          </div>
        );
        
      case 'risk_identification':
        return (
          <div className="space-y-4">
            {Array.isArray(result.content) ? result.content.map((risk, index) => (
              <Card key={index} className="border-l-4 border-l-amber-400">
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex gap-2 items-center">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    {risk.risk}
                  </CardTitle>
                  {risk.severity && (
                    <Badge 
                      variant={risk.severity === "High" ? "destructive" : 
                              risk.severity === "Medium" ? "warning" : "outline"}
                      className="ml-auto"
                    >
                      {risk.severity}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="pt-0 pb-3">
                  <p className="text-sm my-1">Location: {risk.location || 'Not specified'}</p>
                  <p className="text-sm text-muted-foreground">{risk.explanation}</p>
                </CardContent>
              </Card>
            )) : (
              <p>No risks identified.</p>
            )}
          </div>
        );
        
      default:
        // For other analysis types, render a generic view
        return (
          <div>
            <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(result.content, null, 2)}
            </pre>
          </div>
        );
    }
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
          <TabsList className="mb-4">
            {ANALYSIS_TYPES.map(type => (
              <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-1">
                {type.icon}
                {type.label}
                {analysisInProgress === type.id && (
                  <Loader2 className="h-3 w-3 animate-spin ml-1" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {ANALYSIS_TYPES.map(type => (
            <TabsContent key={type.id} value={type.id} className="pt-2">
              {renderAnalysisContent(type.id)}
              
              {analysisResults[type.id] && (
                <Alert className="mt-6 bg-muted/50">
                  <AlertDescription className="text-xs text-muted-foreground">
                    This analysis is AI-generated and provided for informational purposes only. It is not legal or professional advice and should be reviewed by qualified professionals.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentAnalyzerView;

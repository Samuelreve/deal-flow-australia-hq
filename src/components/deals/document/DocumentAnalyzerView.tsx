
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocumentAI } from '@/hooks/document-ai';
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, Loader2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from '@/components/ui/use-toast';

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

  const renderAnalysisContent = (analysisType: string) => {
    const result = analysisResults[analysisType];
    const loading = analysisInProgress === analysisType || (aiLoading && !result);
    
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Analyzing document...</p>
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
          <div className="space-y-3">
            {Array.isArray(result.content) ? result.content.map((clause, index) => (
              <div key={index} className="border-b pb-2">
                <h4 className="font-medium">{clause.heading}</h4>
                <p className="text-sm text-muted-foreground">{clause.summary}</p>
              </div>
            )) : (
              <p>No key clauses identified.</p>
            )}
          </div>
        );
        
      case 'risk_identification':
        return (
          <div className="space-y-3">
            {Array.isArray(result.content) ? result.content.map((risk, index) => (
              <div key={index} className="border-b pb-3">
                <div className="flex gap-2 items-center">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <h4 className="font-medium">{risk.risk}</h4>
                </div>
                <p className="text-sm my-1">Location: {risk.location || 'Not specified'}</p>
                <p className="text-sm text-muted-foreground">{risk.explanation}</p>
              </div>
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

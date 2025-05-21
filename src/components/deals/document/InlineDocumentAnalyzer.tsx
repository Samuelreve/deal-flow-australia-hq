
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentAI } from '@/hooks/document-ai';
import { AIResponse } from '@/hooks/document-ai/useDocumentAIBase';
import { FileText, FileSearch, AlertTriangle, X, Loader } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import DocumentAnalysisResults from './DocumentAnalysisResults';

interface InlineDocumentAnalyzerProps {
  documentId: string;
  versionId: string;
  documentName: string;
  dealId: string;
  userRole?: string;
  onClose: () => void;
}

type AnalysisType = 'summarize' | 'key_clauses' | 'risk_identification' | 'general';

const InlineDocumentAnalyzer = ({
  documentId,
  versionId,
  documentName,
  dealId,
  userRole = 'user',
  onClose
}: InlineDocumentAnalyzerProps) => {
  const [analysisType, setAnalysisType] = useState<AnalysisType | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [disclaimer, setDisclaimer] = useState<string>('');
  
  const {
    summarizeDocument,
    analyzeDocument,
    loading,
    error
  } = useDocumentAI({ dealId, documentId });
  
  const handleSummarize = async () => {
    setAnalysisType('summarize');
    setAnalysisResult(null);
    
    try {
      const result = await summarizeDocument('', documentId, versionId);
      
      if (result?.summary) {
        setAnalysisResult({
          type: 'summary',
          content: { summary: result.summary }
        });
        setDisclaimer(result.disclaimer || 'This summary is AI-generated and may not capture all details of the original document.');
      }
    } catch (error) {
      console.error("Document summary error:", error);
    }
  };
  
  const handleAnalyze = async (type: 'key_clauses' | 'risk_identification' | 'general') => {
    setAnalysisType(type);
    setAnalysisResult(null);
    
    try {
      const result = await analyzeDocument(documentId, versionId, type);
      
      if (result?.analysis) {
        setAnalysisResult(result.analysis);
        setDisclaimer(result.disclaimer || 'This analysis is AI-generated and provided for informational purposes only.');
      }
    } catch (error) {
      console.error("Document analysis error:", error);
    }
  };
  
  const renderAnalysisButtons = () => (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleSummarize}
        disabled={loading}
        className="flex items-center gap-1"
      >
        <FileText className="h-4 w-4" />
        Summarize
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleAnalyze('key_clauses')}
        disabled={loading}
        className="flex items-center gap-1"
      >
        <FileSearch className="h-4 w-4" />
        Key Clauses
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleAnalyze('risk_identification')}
        disabled={loading}
        className="flex items-center gap-1"
      >
        <AlertTriangle className="h-4 w-4" />
        Risk Analysis
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleAnalyze('general')}
        disabled={loading}
        className="flex items-center gap-1"
      >
        <FileSearch className="h-4 w-4" />
        General Analysis
      </Button>
    </div>
  );
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Analyzing document...</p>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>
            {error || 'An error occurred during document analysis.'}
          </AlertDescription>
        </Alert>
      );
    }
    
    if (analysisResult) {
      if (analysisType === 'summarize') {
        return (
          <div className="mt-4 space-y-4">
            <h3 className="text-lg font-medium">Document Summary</h3>
            <div className="whitespace-pre-wrap text-sm">
              {analysisResult.content.summary}
            </div>
            
            <div className="text-xs text-muted-foreground border-t pt-2 mt-4">
              <p>{disclaimer}</p>
            </div>
          </div>
        );
      } else {
        return (
          <DocumentAnalysisResults
            analysisType={analysisType || 'general'}
            result={analysisResult}
            disclaimer={disclaimer}
            onBack={() => setAnalysisResult(null)}
          />
        );
      }
    }
    
    return (
      <div className="py-4">
        <p className="mb-4">Select an analysis type to get insights about your document:</p>
        {renderAnalysisButtons()}
      </div>
    );
  };

  return (
    <Card className="mt-6 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Document Uploaded: {documentName}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Analyze your document to get key insights
        </CardDescription>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="pt-4">
        {renderContent()}
      </CardContent>
      
      {analysisResult && (
        <CardFooter className="flex justify-end pt-0">
          <Button variant="outline" size="sm" onClick={() => setAnalysisResult(null)}>
            Back to Analysis Options
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default InlineDocumentAnalyzer;

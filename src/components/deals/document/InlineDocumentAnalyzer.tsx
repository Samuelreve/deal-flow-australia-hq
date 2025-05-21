
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

type AnalysisType = 'summarize_contract' | 'key_clauses' | 'risk_identification';

const InlineDocumentAnalyzer: React.FC<InlineDocumentAnalyzerProps> = ({
  documentId,
  versionId,
  documentName,
  dealId,
  userRole = 'user',
  onClose
}) => {
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisType | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  const {
    analyzeDocument,
    summarizeContract,
    loading: isAnalyzing
  } = useDocumentAI({ dealId, documentId });

  const runAnalysis = async (analysisType: AnalysisType) => {
    setActiveAnalysis(analysisType);
    setAnalysisResult(null);
    
    try {
      let result;
      
      if (analysisType === 'summarize_contract') {
        result = await summarizeContract(documentId, versionId);
        if (result) {
          setAnalysisResult({
            type: 'summary',
            content: { summary: result.summary }
          });
        }
      } else {
        result = await analyzeDocument(documentId, versionId, analysisType);
        if (result) {
          setAnalysisResult(result.analysis);
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Document Analysis</CardTitle>
            <CardDescription>
              File uploaded successfully: {documentName}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {!activeAnalysis ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">What would you like to know about this document?</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="justify-start text-left"
                onClick={() => runAnalysis('summarize_contract')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Summary
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start text-left"
                onClick={() => runAnalysis('key_clauses')}
              >
                <FileSearch className="mr-2 h-4 w-4" />
                Extract Key Clauses
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start text-left"
                onClick={() => runAnalysis('risk_identification')}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Identify Risks
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {isAnalyzing && !analysisResult ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Analyzing document...</p>
                <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    {activeAnalysis === 'summarize_contract' && 'Document Summary'}
                    {activeAnalysis === 'key_clauses' && 'Key Clauses'}
                    {activeAnalysis === 'risk_identification' && 'Risk Analysis'}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveAnalysis(null)}
                    className="h-8 px-2 text-xs"
                  >
                    Try a different analysis
                  </Button>
                </div>
                
                <Separator />
                
                {analysisResult && (
                  <div className="py-2">
                    <DocumentAnalysisResults 
                      analysisType={activeAnalysis}
                      result={analysisResult}
                      disclaimer="This is an AI-generated analysis provided for informational purposes only."
                      onBack={() => setActiveAnalysis(null)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-muted/20 flex justify-end py-2 border-t">
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InlineDocumentAnalyzer;

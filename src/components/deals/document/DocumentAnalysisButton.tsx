
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DocumentAnalysisTypeSelector from "./DocumentAnalysisTypeSelector";
import DocumentAnalysisResults from "./DocumentAnalysisResults";
import { useDocumentAI } from "@/hooks/document-ai";

interface DocumentAnalysisButtonProps {
  dealId: string;
  documentId: string;
  versionId: string;
  userRole?: string;
  className?: string;
}

const DocumentAnalysisButton: React.FC<DocumentAnalysisButtonProps> = ({
  dealId,
  documentId,
  versionId,
  userRole = 'user',
  className
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [analysisType, setAnalysisType] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [disclaimer, setDisclaimer] = useState<string>('');
  
  const {
    analyzeDocument,
    loading: isAnalyzing,
  } = useDocumentAI({ dealId, documentId });

  // Check if user role allows document analysis
  const canAnalyzeDocuments = ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase());
  
  if (!canAnalyzeDocuments) {
    return null;
  }
  
  const handleAnalysisTypeSelect = async (type: string) => {
    setAnalysisType(type);
    
    try {
      const result = await analyzeDocument(documentId, versionId, type);
      
      if (result) {
        setAnalysisResult(result.analysis);
        setDisclaimer(result.disclaimer);
      }
    } catch (error) {
      console.error('Document analysis failed:', error);
    }
  };
  
  const handleClose = () => {
    setIsDialogOpen(false);
    // Reset state after a delay to allow dialog animation to complete
    setTimeout(() => {
      setAnalysisType('');
      setAnalysisResult(null);
    }, 300);
  };
  
  return (
    <>
      <Button 
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        className={`gap-2 ${className || ''}`}
        size="sm"
      >
        <Sparkles className="h-4 w-4" />
        Analyze Document
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {analysisResult ? `Document Analysis: ${analysisType}` : 'Analyze Document with AI'}
            </DialogTitle>
          </DialogHeader>
          
          {!analysisResult ? (
            <DocumentAnalysisTypeSelector 
              onSelect={handleAnalysisTypeSelect}
              isAnalyzing={isAnalyzing}
            />
          ) : (
            <DocumentAnalysisResults 
              analysisType={analysisType}
              result={analysisResult}
              disclaimer={disclaimer}
              onBack={() => setAnalysisResult(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentAnalysisButton;

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileText, AlertTriangle, Key } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { documentAnalysisService } from "@/services/documentAnalysisService";

import { Document } from "@/types/deal";

interface AnalysisResult {
  summary?: string;
  keyTerms?: string[];
  risks?: string[];
  analysisType: string;
}

interface DocumentAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  dealId: string;
  analysisType: 'summary' | 'key_terms' | 'risks';
}

const DocumentAnalysisModal: React.FC<DocumentAnalysisModalProps> = ({
  isOpen,
  onClose,
  document,
  dealId,
  analysisType
}) => {
  const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisResult>>({});
  const [loadingAnalysis, setLoadingAnalysis] = useState<Record<string, boolean>>({});
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const getAnalysisTitle = (type: string) => {
    switch (type) {
      case 'summary': return 'Document Summary';
      case 'key_terms': return 'Key Terms';
      case 'risks': return 'Risk Analysis';
      default: return 'Document Analysis';
    }
  };

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'summary': return FileText;
      case 'key_terms': return Key;
      case 'risks': return AlertTriangle;
      default: return FileText;
    }
  };

  const performAnalysis = async (analysisType: string) => {
    if (!document || !user) return;

    console.log('🔍 DocumentAnalysisModal performAnalysis called:', {
      analysisType,
      documentId: document.id,
      documentName: document.name
    });

    setLoadingAnalysis(prev => ({ ...prev, [analysisType]: true }));
    
    try {
      // Get the latest document version
      const { data: versionData, error: versionError } = await supabase
        .from('document_versions')
        .select('id, text_content')
        .eq('document_id', document.id)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      console.log('📄 Document version data:', {
        versionData,
        versionError,
        textContentType: typeof versionData?.text_content,
        textContentValue: versionData?.text_content
      });

      if (versionError || !versionData?.id) {
        throw new Error('Document version not found');
      }

      // First, extract the document text content
      console.log('🔍 Extracting document content...');
      const { data: contentData, error: contentError } = await supabase.functions.invoke('document-content-retrieval', {
        body: {
          versionId: versionData.id,
          dealId: dealId
        }
      });

      console.log('📄 Content extraction result:', {
        success: !contentError,
        hasContent: !!contentData?.content,
        contentLength: contentData?.content?.length || 0,
        contentPreview: contentData?.content ? contentData.content.substring(0, 100) + '...' : 'No content',
        error: contentError?.message
      });

      // LOG THE FULL EXTRACTED TEXT FOR DEBUGGING
      console.log('🔍 FULL EXTRACTED TEXT:', contentData?.content);

      if (contentError || !contentData?.content) {
        throw new Error('Failed to extract document content: ' + (contentError?.message || 'No content found'));
      }

      // Call the document AI assistant edge function for OCR-based analysis
      const requestBody = {
        operation: 'analyze_document',
        documentId: document.id,
        documentVersionId: versionData.id,
        analysisType: analysisType,
        dealId: dealId,
        context: {
          analysisType: analysisType,
          documentName: document.name,
          documentType: document.type,
          useOCR: true
        }
      };

      console.log('📤 Sending OCR-based analysis request:', requestBody);

      const { data: result, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: requestBody
      });

      console.log('📡 DocumentAnalysisModal AI response:', {
        success: !error,
        hasData: !!result,
        error: error?.message,
        result: result
      });

      if (error) {
        console.error('AI analysis error:', error);
        throw new Error('Failed to analyze document');
      }

       // The response from document-ai-assistant comes directly with summary, keyTerms, etc.
       // No nested 'success' property based on network logs
       if (result && !error) {
         const analysisResult: AnalysisResult = {
           analysisType,
           summary: result.summary,
           keyTerms: result.keyTerms || result.keyPoints || [],
           risks: result.risks || []
         };

         console.log('✅ Analysis result processed:', analysisResult);

         // Save the analysis to the database
         try {
           await documentAnalysisService.saveAnalysis({
             documentId: document.id,
             documentVersionId: versionData.id,
             analysisType: analysisType,
             analysisContent: analysisResult
           });
           console.log('💾 Analysis saved to database');
         } catch (saveError) {
           console.error('Error saving analysis to database:', saveError);
           // Don't fail the whole operation if saving fails
         }

         setAnalysisResults(prev => ({
           ...prev,
           [analysisType]: analysisResult
         }));

         toast({
           title: "Analysis completed",
           description: `${analysisType.replace('_', ' ')} analysis has been generated`,
         });
       } else {
         throw new Error('No analysis result received');
       }
    } catch (error: any) {
      console.error("Error performing analysis:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze document",
        variant: "destructive",
      });
    } finally {
      setLoadingAnalysis(prev => ({ ...prev, [analysisType]: false }));
    }
  };

  const renderAnalysisContent = (analysisType: string) => {
    const result = analysisResults[analysisType];
    const isLoading = loadingAnalysis[analysisType];

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Analyzing document...
        </div>
      );
    }

    if (!result) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Click the button below to analyze this document
          </p>
          <Button onClick={() => performAnalysis(analysisType)}>
            Analyze Document
          </Button>
        </div>
      );
    }

    switch (analysisType) {
      case 'summary':
        return (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm leading-relaxed">
                  {result.summary || 'No summary available'}
                </p>
              </CardContent>
            </Card>
            <Button 
              variant="outline" 
              onClick={() => performAnalysis(analysisType)}
              disabled={isLoading}
            >
              Regenerate Summary
            </Button>
          </div>
        );

      case 'key_terms':
        return (
          <div className="space-y-4">
            {result.keyTerms && result.keyTerms.length > 0 ? (
              <div className="space-y-2">
                {result.keyTerms.map((term, index) => (
                  <Badge key={index} variant="outline" className="mr-2 mb-2">
                    {term}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No key terms identified</p>
            )}
            <Button 
              variant="outline" 
              onClick={() => performAnalysis(analysisType)}
              disabled={isLoading}
            >
              Regenerate Analysis
            </Button>
          </div>
        );

      case 'risks':
        return (
          <div className="space-y-4">
            {result.risks && result.risks.length > 0 ? (
              <div className="space-y-3">
                {result.risks.map((risk, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                        <p className="text-sm">{risk}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No significant risks identified</p>
            )}
            <Button 
              variant="outline" 
              onClick={() => performAnalysis(analysisType)}
              disabled={isLoading}
            >
              Regenerate Analysis
            </Button>
          </div>
        );

      default:
        return <p className="text-muted-foreground">Analysis type not supported</p>;
    }
  };

  
  // Clear analysis results when document changes
  React.useEffect(() => {
    if (document && document.id !== currentDocumentId) {
      console.log('📄 Document changed, clearing analysis results');
      setAnalysisResults({});
      setLoadingAnalysis({});
      setCurrentDocumentId(document.id);
    }
  }, [document, currentDocumentId]);

  // Load existing analysis when modal opens
  React.useEffect(() => {
    const loadExistingAnalysis = async () => {
      if (!isOpen || !document) return;

      console.log('🔍 Loading existing analysis for:', {
        documentId: document.id,
        analysisType
      });

      try {
        // Get the latest document version
        const { data: versionData, error: versionError } = await supabase
          .from('document_versions')
          .select('id')
          .eq('document_id', document.id)
          .order('version_number', { ascending: false })
          .limit(1)
          .single();

        if (versionError || !versionData?.id) {
          console.log('📄 No document version found, will need to generate new analysis');
          return;
        }

        // Check if we already have this analysis loaded
        if (analysisResults[analysisType]) {
          console.log('📄 Analysis already loaded in state');
          return;
        }

        // Try to load existing analysis from database
        const existingAnalysis = await documentAnalysisService.getLatestAnalysis(
          versionData.id,
          analysisType
        );

        if (existingAnalysis) {
          console.log('💾 Found existing analysis:', existingAnalysis);
          
          // Load the existing analysis into state
          setAnalysisResults(prev => ({
            ...prev,
            [analysisType]: existingAnalysis.analysisContent
          }));

          toast({
            title: "Analysis loaded",
            description: `Existing ${analysisType.replace('_', ' ')} analysis loaded`,
          });
        } else {
          console.log('🔄 No existing analysis found, generating new one...');
          // No existing analysis, generate a new one
          performAnalysis(analysisType);
        }
      } catch (error) {
        console.error('Error loading existing analysis:', error);
        // If loading fails, try to generate new analysis
        performAnalysis(analysisType);
      }
    };

    loadExistingAnalysis();
  }, [isOpen, document, analysisType]);

  if (!document) return null;

  const Icon = getAnalysisIcon(analysisType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {getAnalysisTitle(analysisType)}: {document.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {renderAnalysisContent(analysisType)}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentAnalysisModal;
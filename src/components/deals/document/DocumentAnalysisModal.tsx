import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileText, AlertTriangle, Key } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Document {
  id: string;
  name: string;
  category?: string;
  status: string;
  version: number;
  size: number;
  type: string;
  created_at: string;
  uploaded_by: string;
  storage_path: string;
}

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
}

const DocumentAnalysisModal: React.FC<DocumentAnalysisModalProps> = ({
  isOpen,
  onClose,
  document,
  dealId
}) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisResult>>({});
  const [loadingAnalysis, setLoadingAnalysis] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { user } = useAuth();

  const analysisTypes = [
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'key_terms', label: 'Key Terms', icon: Key },
    { id: 'risks', label: 'Risks', icon: AlertTriangle }
  ];

  const performAnalysis = async (analysisType: string) => {
    if (!document || !user) return;

    setLoadingAnalysis(prev => ({ ...prev, [analysisType]: true }));
    
    try {
      // Call the document AI assistant edge function for analysis
      const { data: result, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'analyze_document',
          documentId: document.id,
          documentVersionId: document.id, // Use document ID as version ID for now
          userId: user.id,
          dealId: dealId,
          context: {
            analysisType: analysisType,
            documentName: document.name,
            documentType: document.type
          }
        }
      });

      if (error) {
        console.error('AI analysis error:', error);
        throw new Error('Failed to analyze document');
      }

      if (result?.success) {
        const analysisResult: AnalysisResult = {
          analysisType,
          ...result
        };

        setAnalysisResults(prev => ({
          ...prev,
          [analysisType]: analysisResult
        }));

        toast({
          title: "Analysis completed",
          description: `${analysisType.replace('_', ' ')} analysis has been generated`,
        });
      } else {
        throw new Error(result?.error || 'Analysis failed');
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

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>AI Document Analysis: {document.name}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              {analysisTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {type.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {analysisTypes.map((type) => (
              <TabsContent key={type.id} value={type.id} className="mt-6">
                {renderAnalysisContent(type.id)}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentAnalysisModal;
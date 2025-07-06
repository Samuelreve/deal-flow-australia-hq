import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileText, AlertTriangle, Key, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Document {
  id: string;
  name: string;
  type: string;
}

interface DirectAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  dealId: string;
  analysisType: 'summary' | 'key_terms' | 'risks';
}

const DirectAnalysisModal: React.FC<DirectAnalysisModalProps> = ({
  isOpen,
  onClose,
  document,
  dealId,
  analysisType
}) => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const getTitle = () => {
    switch (analysisType) {
      case 'summary': return 'Document Summary';
      case 'key_terms': return 'Key Terms Analysis';
      case 'risks': return 'Risk Analysis';
      default: return 'Document Analysis';
    }
  };

  const getIcon = () => {
    switch (analysisType) {
      case 'summary': return FileText;
      case 'key_terms': return Key;
      case 'risks': return AlertTriangle;
      default: return FileText;
    }
  };

  const performAnalysis = async () => {
    if (!document || !user) return;

    setLoading(true);
    try {
      // Get the latest document version first
      const { data: versions, error: versionError } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', document.id)
        .order('version_number', { ascending: false })
        .limit(1);

      if (versionError || !versions || versions.length === 0) {
        console.error('No document versions found:', versionError);
        throw new Error('No document versions found');
      }

      const latestVersion = versions[0];

      const { data: result, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'analyze_document',
          documentId: document.id,
          documentVersionId: latestVersion.id,
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
        console.error('Edge function error:', error);
        throw new Error('Failed to analyze document');
      }

      if (result) {
        setResult(result);
      } else {
        throw new Error('Analysis failed - no result received');
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && document) {
      setResult(null);
      performAnalysis();
    }
  }, [isOpen, document, analysisType]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span>Analyzing document...</span>
        </div>
      );
    }

    if (!result) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No analysis results available</p>
        </div>
      );
    }

    switch (analysisType) {
      case 'summary':
        return (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm leading-relaxed">
                {result.summary || 'No summary available'}
              </p>
              {result.keyPoints && result.keyPoints.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Key Points:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {result.keyPoints.map((point: string, index: number) => (
                      <li key={index} className="text-sm">{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'key_terms':
        return (
          <div className="space-y-4">
            {result.keyTerms && result.keyTerms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.keyTerms.map((term: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {term}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No key terms identified</p>
            )}
          </div>
        );

      case 'risks':
        return (
          <div className="space-y-3">
            {result.risks && result.risks.length > 0 ? (
              result.risks.map((risk: string, index: number) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{risk}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No significant risks identified</p>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Analysis type not supported</p>
          </div>
        );
    }
  };

  const Icon = getIcon();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {getTitle()}: {document?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {renderContent()}
          
          {result?.disclaimer && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-600 dark:text-blue-400">{result.disclaimer}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={performAnalysis}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Regenerate
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DirectAnalysisModal;
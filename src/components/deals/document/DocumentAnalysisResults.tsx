import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Key, AlertTriangle, RotateCcw } from "lucide-react";

interface AnalysisResult {
  summary?: string;
  keyTerms?: string[];
  risks?: string[];
  analysisType: string;
}

interface DocumentAnalysisResultsProps {
  analysisType: string;
  result: AnalysisResult | null;
  isLoading?: boolean;
  onRegenerate?: () => void;
  disclaimer?: string;
  onBack?: () => void;
}

const DocumentAnalysisResults: React.FC<DocumentAnalysisResultsProps> = ({
  analysisType,
  result,
  isLoading,
  onRegenerate
}) => {
  const getTitle = () => {
    switch (analysisType) {
      case 'summary': return 'Document Summary';
      case 'key_terms': return 'Key Terms';
      case 'risks': return 'Risk Analysis';
      default: return 'Analysis Results';
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

  const Icon = getIcon();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {getTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Analyzing document...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  const renderContent = () => {
    switch (analysisType) {
      case 'summary':
        return (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed">
              {result.summary || 'No summary available'}
            </p>
          </div>
        );

      case 'key_terms':
        return (
          <div className="space-y-4">
            {result.keyTerms && result.keyTerms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.keyTerms.map((term, index) => (
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
          <div className="space-y-4">
            {result.risks && result.risks.length > 0 ? (
              <div className="space-y-3">
                {result.risks.map((risk, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{risk}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No significant risks identified</p>
            )}
          </div>
        );

      default:
        return <p className="text-muted-foreground">Analysis type not supported</p>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {getTitle()}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default DocumentAnalysisResults;
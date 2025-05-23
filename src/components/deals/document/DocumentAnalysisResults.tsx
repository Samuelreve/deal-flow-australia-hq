
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft } from "lucide-react";
import { getAnalysisRenderer } from './analysis-renderers';

interface DocumentAnalysisResultsProps {
  analysisType: string;
  result: {
    type: string;
    content: any;
  };
  disclaimer: string;
  onBack: () => void;
}

const DocumentAnalysisResults: React.FC<DocumentAnalysisResultsProps> = ({
  analysisType,
  result,
  disclaimer,
  onBack
}) => {
  // Get the appropriate renderer component for this analysis type
  const RendererComponent = getAnalysisRenderer(analysisType);

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        className="flex items-center gap-1 px-2" 
        onClick={onBack}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to analysis types
      </Button>
      
      <div>
        <RendererComponent content={result.content} />
      </div>
      
      <Alert className="bg-muted/50">
        <AlertDescription className="text-xs text-muted-foreground">
          {disclaimer || "This is an AI-generated analysis and should be reviewed by a professional. The analysis may not be complete or accurate."}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DocumentAnalysisResults;

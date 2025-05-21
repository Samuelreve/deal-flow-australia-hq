
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ExplanationTabProps {
  explanationResult: any | null;
  isAnalyzing: boolean;
  selectedText: string | null;
}

const ExplanationTab: React.FC<ExplanationTabProps> = ({ 
  explanationResult, 
  isAnalyzing, 
  selectedText 
}) => {
  if (isAnalyzing) {
    return <div className="py-8 text-center">Analyzing clause...</div>;
  }
  
  if (!explanationResult) {
    return (
      <div className="py-8 text-center">
        {selectedText ? "Analyzing..." : "Select text in the document to explain a clause"}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Clause Explanation</h3>
        <p className="mt-2 whitespace-pre-line">{explanationResult.explanation}</p>
      </div>
      
      {explanationResult.isAmbiguous && (
        <Alert className="bg-amber-50 border-amber-300">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            This clause contains ambiguous language. {explanationResult.ambiguityExplanation}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ExplanationTab;

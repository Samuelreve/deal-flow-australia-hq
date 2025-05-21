
import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExplanationTabProps {
  explanationResult: any;
  isAnalyzing: boolean;
  selectedText: string | null;
}

const ExplanationTab: React.FC<ExplanationTabProps> = ({ 
  explanationResult, 
  isAnalyzing,
  selectedText 
}) => {
  if (!selectedText) {
    return (
      <Alert variant="default" className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription>
          Please select a clause from the contract to get an explanation.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Analyzing selected clause...</p>
      </div>
    );
  }
  
  if (!explanationResult) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Click the "Explain" button to get an analysis of the selected clause.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-md border text-sm">
        <h4 className="text-sm font-medium mb-2">Selected Text:</h4>
        <p className="italic text-gray-700">{selectedText}</p>
      </div>
      
      <div className="prose prose-sm max-w-none">
        <h3 className="text-lg font-medium">Explanation</h3>
        <div className="whitespace-pre-wrap">
          {explanationResult.explanation}
        </div>
        
        {explanationResult.isAmbiguous && (
          <Alert className="mt-4 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              <strong>Note:</strong> {explanationResult.ambiguityExplanation}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ExplanationTab;

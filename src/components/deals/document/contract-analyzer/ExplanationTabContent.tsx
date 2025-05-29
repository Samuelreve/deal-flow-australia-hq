
import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExplanationTabContentProps {
  selectedText: string;
  setSelectedText: (text: string) => void;
  explanationResult: any;
  isAnalyzing: boolean;
  onExplain: () => void;
}

const ExplanationTabContent: React.FC<ExplanationTabContentProps> = ({
  selectedText,
  setSelectedText,
  explanationResult,
  isAnalyzing,
  onExplain
}) => {
  if (isAnalyzing) {
    return (
      <div className="py-8 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Analyzing clause...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-medium">Enter text to explain</h3>
        <Textarea 
          className="mt-2" 
          value={selectedText} 
          onChange={(e) => setSelectedText(e.target.value)}
          placeholder="Copy and paste the clause or section you want explained..."
          rows={5}
        />
        
        <Button 
          onClick={onExplain} 
          className="mt-2"
          disabled={!selectedText.trim() || isAnalyzing}
        >
          {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Explain This Text
        </Button>
      </div>
      
      {explanationResult && (
        <div>
          <h3 className="text-lg font-medium">Explanation</h3>
          <p className="mt-2 whitespace-pre-line">{explanationResult.explanation}</p>
          
          {explanationResult.isAmbiguous && (
            <Alert className="bg-amber-50 border-amber-300 mt-4">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                This clause contains potentially ambiguous language that may benefit from clarification.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default ExplanationTabContent;

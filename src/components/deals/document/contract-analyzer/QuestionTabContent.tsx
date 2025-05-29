
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuestionTabContentProps {
  userQuestion: string;
  setUserQuestion: (question: string) => void;
  explanationResult: any;
  isAnalyzing: boolean;
  onAskQuestion: () => void;
}

const QuestionTabContent: React.FC<QuestionTabContentProps> = ({
  userQuestion,
  setUserQuestion,
  explanationResult,
  isAnalyzing,
  onAskQuestion
}) => {
  if (isAnalyzing) {
    return (
      <div className="py-8 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Finding answer...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-medium">Ask a question about this contract</h3>
        <div className="flex items-center gap-2 mt-2">
          <Input 
            value={userQuestion} 
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="e.g., What happens if I cancel early?"
            className="flex-1"
          />
          <Button 
            onClick={onAskQuestion} 
            disabled={!userQuestion.trim() || isAnalyzing}
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Ask
          </Button>
        </div>
      </div>
      
      {explanationResult && (
        <div>
          <h3 className="text-lg font-medium">Answer</h3>
          <p className="mt-2 whitespace-pre-line">{explanationResult.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionTabContent;

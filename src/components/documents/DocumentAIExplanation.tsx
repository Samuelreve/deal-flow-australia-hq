
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';

interface ExplanationResult {
  explanation?: string;
  disclaimer: string;
}

interface DocumentAIExplanationProps {
  loading: boolean;
  explanationResult: ExplanationResult | null;
  onClose: () => void;
}

const DocumentAIExplanation: React.FC<DocumentAIExplanationProps> = ({
  loading,
  explanationResult,
  onClose,
}) => {
  return (
    <div className="p-4 border rounded-lg bg-muted/50" id="explanation-display">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-semibold">AI Explanation</h4>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {loading ? (
        <div className="flex items-center text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Getting explanation...
        </div>
      ) : explanationResult ? (
        <div>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{explanationResult.explanation || ''}</ReactMarkdown>
          </div>
          {explanationResult.disclaimer && (
            <p className="text-sm text-muted-foreground italic mt-2">{explanationResult.disclaimer}</p>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground">Select text in the document to get an explanation.</p>
      )}
    </div>
  );
};

export default DocumentAIExplanation;

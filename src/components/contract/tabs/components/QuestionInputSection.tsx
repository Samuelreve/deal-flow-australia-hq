
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader } from 'lucide-react';

interface QuestionInputSectionProps {
  question: string;
  setQuestion: (question: string) => void;
  onSubmit: () => void;
  loading: boolean;
  isProcessing: boolean;
  contractText: string;
}

const QuestionInputSection: React.FC<QuestionInputSectionProps> = ({
  question,
  setQuestion,
  onSubmit,
  loading,
  isProcessing,
  contractText
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const isDisabled = loading || isProcessing || !contractText || !question.trim();

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          placeholder="Ask a question about your contract... (e.g., 'What are the key obligations of each party?')"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          className="min-h-[80px] pr-12 resize-none"
          disabled={loading || isProcessing || !contractText}
        />
        <Button
          onClick={onSubmit}
          disabled={isDisabled}
          size="sm"
          className="absolute bottom-2 right-2 h-8 w-8 p-0"
        >
          {loading || isProcessing ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {!contractText && (
        <p className="text-sm text-muted-foreground">
          Upload a contract document first to ask questions about it.
        </p>
      )}
    </div>
  );
};

export default QuestionInputSection;

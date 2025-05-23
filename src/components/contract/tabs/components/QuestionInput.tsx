
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface QuestionInputProps {
  question: string;
  onQuestionChange: (question: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
  contractText: string;
}

const QuestionInput: React.FC<QuestionInputProps> = ({
  question,
  onQuestionChange,
  onSubmit,
  isProcessing,
  contractText
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  if (!contractText) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">
          Contract content is not available. Try selecting a different contract.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about this contract..."
          className="pr-12 min-h-[80px] resize-none"
          disabled={isProcessing}
        />
        <Button
          size="icon"
          onClick={onSubmit}
          disabled={!question.trim() || isProcessing}
          className="absolute right-2 bottom-2 h-8 w-8"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">Press Enter to submit</p>
    </div>
  );
};

export default QuestionInput;

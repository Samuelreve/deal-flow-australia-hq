
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from 'lucide-react';

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
  const [suggestions] = useState([
    "What are the key terms and conditions?",
    "What are the payment obligations?",
    "What are the termination clauses?",
    "Are there any liability limitations?",
    "What are the deadlines mentioned?",
    "What are the penalties for breach?"
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
  };

  const isDisabled = loading || isProcessing || !contractText.trim();

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={contractText.trim() ? "Ask a question about your contract..." : "Please upload a contract first"}
            className="min-h-[100px] pr-12 resize-none"
            disabled={isDisabled}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!question.trim() || isDisabled}
            className="absolute bottom-2 right-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>

      {contractText.trim() && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Suggested questions:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isDisabled}
                className="text-left justify-start h-auto p-2 text-sm"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionInputSection;

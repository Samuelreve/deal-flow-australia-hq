
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader } from 'lucide-react';

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
    if (e.key === 'Enter' && !loading && !isProcessing) {
      onSubmit();
    }
  };

  return (
    <div className="flex gap-3 mb-6">
      <Input 
        placeholder="e.g., What are the termination clauses in this contract?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyPress}
        disabled={loading || isProcessing || !contractText.trim()}
        className="flex-1 border-slate-300 focus:border-blue-500"
      />
      <Button 
        onClick={onSubmit} 
        disabled={loading || isProcessing || !contractText.trim()}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6"
      >
        {(loading || isProcessing) ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Analyzing
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Ask Question
          </>
        )}
      </Button>
    </div>
  );
};

export default QuestionInputSection;

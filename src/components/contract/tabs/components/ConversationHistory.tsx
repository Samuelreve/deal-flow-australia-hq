
import React from 'react';
import { Brain, Loader2 } from "lucide-react";
import { MinimalLoadingSpinner } from "../../loading/ContractLoadingStates";

interface HistoryItem {
  question: string;
  answer: string;
  timestamp: number;
  type: 'question' | 'analysis';
  analysisType?: string;
}

interface ConversationHistoryProps {
  questionHistory: HistoryItem[];
  isProcessing: boolean;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  questionHistory,
  isProcessing
}) => {
  return (
    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
      {questionHistory.map((item, index) => (
        <div key={index} className="space-y-2">
          {/* Question */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="font-semibold text-sm text-primary">You</span>
            </div>
            <div className="bg-muted p-3 rounded-lg rounded-tl-none flex-1">
              <p className="text-sm whitespace-pre-wrap">{item.question}</p>
            </div>
          </div>
          
          {/* Answer */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="bg-card border p-3 rounded-lg rounded-tl-none flex-1">
              <p className="text-sm whitespace-pre-wrap">{item.answer}</p>
              {item.type === 'analysis' && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Analysis type: {item.analysisType}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* Processing state */}
      {isProcessing && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
          </div>
          <div className="bg-card border p-3 rounded-lg rounded-tl-none flex-1">
            <p className="text-sm text-muted-foreground">
              <MinimalLoadingSpinner size="sm" text="Processing your request..." />
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationHistory;


import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Send, Brain, AlertCircle } from "lucide-react";
import { MinimalLoadingSpinner } from '../loading/EnhancedLoadingStates';

interface HistoryItem {
  question: string;
  answer: string;
  type: 'question' | 'analysis';
  analysisType?: string;
}

interface EnhancedContractAssistantTabProps {
  onAskQuestion: (question: string) => Promise<any>;
  onAnalyzeContract: (analysisType: string) => Promise<any>;
  questionHistory: HistoryItem[];
  isProcessing: boolean;
  contractText: string;
  isMobile?: boolean;
}

const analysisOptions = [
  { id: 'summary', label: 'Summary', description: 'Get a concise summary of the entire contract' },
  { id: 'key_clauses', label: 'Key Clauses', description: 'Identify important clauses and terms' },
  { id: 'obligations', label: 'Obligations', description: 'List all obligations for each party' },
  { id: 'risks', label: 'Risks', description: 'Highlight potential risks and liabilities' }
];

const EnhancedContractAssistantTab: React.FC<EnhancedContractAssistantTabProps> = ({
  onAskQuestion,
  onAnalyzeContract,
  questionHistory,
  isProcessing,
  contractText,
  isMobile = false
}) => {
  const [question, setQuestion] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when history updates
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [questionHistory]);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    try {
      await onAskQuestion(question);
      setQuestion('');
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (error) {
      console.error('Error asking question:', error);
    }
  };

  const handleAnalysisSelect = async (analysisType: string) => {
    try {
      await onAnalyzeContract(analysisType);
    } catch (error) {
      console.error('Error analyzing contract:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Analysis Options */}
      <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'flex flex-wrap gap-2'} mb-4`}>
        {analysisOptions.map((option) => (
          <Button
            key={option.id}
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className={`${isMobile ? 'justify-start' : ''} flex items-center gap-2`}
            onClick={() => handleAnalysisSelect(option.id)}
            disabled={isProcessing}
            title={option.description}
            aria-label={`Analyze contract: ${option.label}`}
          >
            <Brain className="h-4 w-4" />
            <span>{option.label}</span>
          </Button>
        ))}
      </div>

      {/* Empty State */}
      {questionHistory.length === 0 && !isProcessing && (
        <Card className="mb-4">
          <CardContent className="p-6 text-center">
            <Brain className="h-10 w-10 mx-auto text-primary/70 mb-3" />
            <h3 className="text-lg font-medium mb-2">Ask about this contract</h3>
            <p className="text-muted-foreground mb-4">
              Ask questions or select an analysis type to get insights about this contract.
            </p>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <p className="font-medium">Example questions:</p>
              <ul className="mt-1 space-y-1">
                <li>• What are the key terms in this contract?</li>
                <li>• What are my obligations as a party?</li>
                <li>• Is there a termination clause?</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Q&A History */}
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
        <div ref={bottomRef} />
      </div>

      {/* Question Input */}
      <div className="mt-auto">
        {contractText ? (
          <div className="flex flex-col">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about this contract..."
                className="pr-12 min-h-[80px] resize-none"
                disabled={isProcessing}
                aria-label="Ask a question about this contract"
              />
              <Button
                size="icon"
                onClick={handleAskQuestion}
                disabled={!question.trim() || isProcessing}
                className="absolute right-2 bottom-2 h-8 w-8"
                aria-label="Submit question"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Press Enter to submit, Shift+Enter for new line</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border border-dashed">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Contract content is not available. Try selecting a different contract.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedContractAssistantTab;


import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Search, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { QuestionHistoryItem } from '@/types/contract';

interface ContractAssistantTabProps {
  onAskQuestion: (question: string) => Promise<{ answer: string; sources?: string[] } | string>;
  questionHistory?: QuestionHistoryItem[];
  isProcessing?: boolean;
}

const ContractAssistantTab: React.FC<ContractAssistantTabProps> = ({ 
  onAskQuestion,
  questionHistory = [],
  isProcessing = false
}) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    
    setLoading(true);
    setAnswer(null);
    setSources([]);
    
    try {
      const response = await onAskQuestion(question);
      
      // Handle different response formats
      if (typeof response === 'string') {
        setAnswer(response);
      } else {
        setAnswer(response.answer);
        if (response.sources) {
          setSources(response.sources);
        }
      }
    } catch (error) {
      toast.error("Failed to process your question");
      console.error("Error processing question:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAnswerText = (answer: string | { answer: string; sources?: string[] }): string => {
    if (typeof answer === 'string') {
      return answer;
    }
    return answer.answer;
  };

  const getAnswerSources = (answer: string | { answer: string; sources?: string[] }): string[] => {
    if (typeof answer === 'string' || !answer.sources) {
      return [];
    }
    return answer.sources;
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contract Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Ask questions about the contract to get instant answers.
          </p>
          
          <div className="flex gap-2">
            <Input 
              placeholder="e.g., What is the duration of this agreement?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && !isProcessing && handleAskQuestion()}
              disabled={loading || isProcessing}
              className="flex-1"
            />
            <Button onClick={handleAskQuestion} disabled={loading || isProcessing}>
              {(loading || isProcessing) ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Ask
                </>
              )}
            </Button>
          </div>
          
          {answer && (
            <div className="bg-muted p-4 rounded-md mt-4">
              <h3 className="font-medium mb-2">Answer:</h3>
              <p className="text-sm">{answer}</p>
              
              {sources && sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs font-medium">Sources:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sources.map((source, index) => (
                      <span key={index} className="bg-secondary text-xs px-2 py-0.5 rounded">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {questionHistory.length > 0 && !answer && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Previous Questions</h3>
              <div className="space-y-3">
                {questionHistory.map((item, index) => (
                  <div key={index} className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm font-medium">{item.question}</p>
                    <p className="text-sm text-muted-foreground mt-1">{getAnswerText(item.answer)}</p>
                    
                    {typeof item.answer !== 'string' && item.answer.sources && item.answer.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/30">
                        <p className="text-xs text-muted-foreground">Sources:</p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {item.answer.sources.map((source, sIndex) => (
                            <span key={sIndex} className="bg-secondary/50 text-xs px-2 py-0.5 rounded">
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground pt-2">
            Try questions like "What happens in case of breach?" or "What is the governing law of this agreement?"
          </div>
        </CardContent>
      </Card>
      
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-sm text-blue-700">
          The AI analyzes the exact contents of your contract to provide accurate answers based solely on the document.
        </AlertDescription>
      </Alert>
    </>
  );
};

export default ContractAssistantTab;


import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Search, Loader, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { QuestionHistoryItem } from '@/types/contract';

interface ContractAssistantTabProps {
  onAskQuestion: (question: string) => Promise<{ answer: string; sources?: string[] } | null>;
  questionHistory?: QuestionHistoryItem[];
  isProcessing?: boolean;
  contractText?: string;
  documentSummary?: any;
}

const ContractAssistantTab: React.FC<ContractAssistantTabProps> = ({ 
  onAskQuestion,
  questionHistory = [],
  isProcessing = false,
  contractText = '',
  documentSummary
}) => {
  const [question, setQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);
  const [currentSources, setCurrentSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    
    if (!contractText.trim()) {
      toast.error("No document uploaded", {
        description: "Please upload a contract first to ask questions about it"
      });
      return;
    }
    
    setLoading(true);
    setCurrentAnswer(null);
    setCurrentSources([]);
    
    try {
      const response = await onAskQuestion(question);
      
      if (response) {
        setCurrentAnswer(response.answer);
        if (response.sources) {
          setCurrentSources(response.sources);
        }
        // Clear the question input after successful submission
        setQuestion("");
      }
    } catch (error) {
      toast.error("Failed to process your question");
      console.error("Error processing question:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && !isProcessing) {
      handleAskQuestion();
    }
  };

  // Function to extract answer text from different answer formats
  const getAnswerText = (answer: string | { answer: string; sources?: string[] }): string => {
    if (typeof answer === 'string') {
      return answer;
    }
    return answer.answer;
  };

  // Function to extract sources from different answer formats
  const getAnswerSources = (answer: string | { answer: string; sources?: string[] }): string[] => {
    if (typeof answer === 'string' || !answer.sources) {
      return [];
    }
    return answer.sources;
  };

  // Show document status
  const renderDocumentStatus = () => {
    if (!documentSummary) {
      return (
        <Alert className="mb-4 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            No document uploaded yet. Please upload a contract to start asking questions.
          </AlertDescription>
        </Alert>
      );
    }

    if (documentSummary.category === 'CONTRACT') {
      return (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ Contract uploaded successfully! You can now ask questions about this document.
          </AlertDescription>
        </Alert>
      );
    }

    if (documentSummary.category === 'FINANCIAL') {
      return (
        <Alert className="mb-4 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            ⚠️ Financial document detected. Please upload a legal contract for detailed analysis.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="mb-4 border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          ❌ Please upload a legal contract for analysis.
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <>
      {renderDocumentStatus()}
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contract Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Ask questions about the uploaded contract to get instant answers based on the document content.
          </p>
          
          <div className="flex gap-2">
            <Input 
              placeholder="e.g., What is the termination period in this contract?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading || isProcessing || !contractText.trim()}
              className="flex-1"
            />
            <Button 
              onClick={handleAskQuestion} 
              disabled={loading || isProcessing || !contractText.trim()}
            >
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
          
          {currentAnswer && (
            <div className="bg-muted p-4 rounded-md mt-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Answer:
              </h3>
              <p className="text-sm whitespace-pre-wrap">{currentAnswer}</p>
              
              {currentSources && currentSources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground">Sources:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentSources.map((source, index) => (
                      <span key={index} className="bg-secondary text-xs px-2 py-0.5 rounded">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {questionHistory.length > 0 && !currentAnswer && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Previous Questions
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {questionHistory.slice().reverse().map((item, index) => (
                  <div key={index} className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm font-medium mb-1">{item.question}</p>
                    <p className="text-sm text-muted-foreground">{getAnswerText(item.answer)}</p>
                    
                    {item.sources && item.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/30">
                        <p className="text-xs text-muted-foreground">Sources:</p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {item.sources.map((source, sIndex) => (
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
          
          <div className="text-xs text-muted-foreground pt-2 space-y-1">
            <p>💡 Try questions like:</p>
            <ul className="ml-4 space-y-1">
              <li>• "Who are the parties in this contract?"</li>
              <li>• "What is the termination period?"</li>
              <li>• "What are the payment terms?"</li>
              <li>• "What happens in case of breach?"</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-sm text-blue-700">
          📋 The AI analyzes only the content of your uploaded contract to provide accurate answers. All responses are based solely on the document text.
        </AlertDescription>
      </Alert>
    </>
  );
};

export default ContractAssistantTab;

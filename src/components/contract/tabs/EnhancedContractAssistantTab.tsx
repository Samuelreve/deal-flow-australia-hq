
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Search, Loader, Sparkles, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { QuestionHistoryItem } from '@/types/contract';

interface EnhancedContractAssistantTabProps {
  onAskQuestion: (question: string, contractText?: string) => Promise<{ answer: string; sources?: string[] } | string>;
  onAnalyzeContract?: (analysisType: string) => Promise<{ answer: string; sources?: string[] } | string>;
  questionHistory?: QuestionHistoryItem[];
  isProcessing?: boolean;
  contractText?: string;
}

const EnhancedContractAssistantTab: React.FC<EnhancedContractAssistantTabProps> = ({ 
  onAskQuestion,
  onAnalyzeContract,
  questionHistory = [],
  isProcessing = false,
  contractText = ""
}) => {
  const [question, setQuestion] = useState("");
  const [analysisTab, setAnalysisTab] = useState("ask");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | { answer: string; sources?: string[] } | null>(null);

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    
    setLoading(true);
    setAnalysisResult(null);
    
    try {
      const response = await onAskQuestion(question, contractText);
      setAnalysisResult(response);
    } catch (error) {
      toast.error("Failed to process your question");
      console.error("Error processing question:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAnalyzeContract = async (analysisType: string) => {
    if (!onAnalyzeContract) return;
    
    setLoading(true);
    setAnalysisResult(null);
    
    try {
      const response = await onAnalyzeContract(analysisType);
      setAnalysisResult(response);
    } catch (error) {
      toast.error(`Failed to analyze contract: ${analysisType}`);
      console.error("Error analyzing contract:", error);
    } finally {
      setLoading(false);
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
  
  // Analysis types for quick access
  const analysisTypes = [
    { id: "summary", label: "Generate Summary", icon: <Sparkles className="h-4 w-4" /> },
    { id: "risks", label: "Identify Risks", icon: <AlertTriangle className="h-4 w-4" /> },
    { id: "keyTerms", label: "Key Terms", icon: <Shield className="h-4 w-4" /> },
    { id: "suggestions", label: "Improvement Suggestions", icon: <Sparkles className="h-4 w-4" /> },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Contract Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={analysisTab} onValueChange={setAnalysisTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ask">Ask Questions</TabsTrigger>
            <TabsTrigger value="analyze">Analyze Contract</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ask" className="space-y-4 pt-4">
            <p className="text-muted-foreground text-sm">
              Ask specific questions about the contract to get instant answers.
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
            
            <div className="text-xs text-muted-foreground">
              Try questions like "What happens in case of breach?" or "What is the governing law?"
            </div>
          </TabsContent>
          
          <TabsContent value="analyze" className="space-y-4 pt-4">
            <p className="text-muted-foreground text-sm">
              Choose an analysis type to get insights about this contract.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {analysisTypes.map((type) => (
                <Button
                  key={type.id}
                  variant="outline"
                  className="justify-start"
                  disabled={loading || isProcessing}
                  onClick={() => handleAnalyzeContract(type.id)}
                >
                  {loading && type.id === analysisTab ? (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <span className="mr-2">{type.icon}</span>
                  )}
                  {type.label}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Display analysis results */}
        {analysisResult && (
          <div className="bg-muted p-4 rounded-md mt-4">
            <h3 className="font-medium mb-2">Result:</h3>
            <p className="text-sm whitespace-pre-line">{getAnswerText(analysisResult)}</p>
            
            {getAnswerSources(analysisResult).length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs font-medium">Sources:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {getAnswerSources(analysisResult).map((source, index) => (
                    <span key={index} className="bg-secondary text-xs px-2 py-0.5 rounded">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Show question history */}
        {questionHistory.length > 0 && !analysisResult && analysisTab === "ask" && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Previous Questions</h3>
            <div className="space-y-3">
              {questionHistory.map((item, index) => (
                <div key={index} className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm font-medium">{item.question}</p>
                  <p className="text-sm text-muted-foreground mt-1">{getAnswerText(item.answer)}</p>
                  
                  {getAnswerSources(item.answer).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/30">
                      <p className="text-xs text-muted-foreground">Sources:</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {getAnswerSources(item.answer).map((source, sIndex) => (
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
        
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-sm text-blue-700">
            The AI analyzes the exact contents of your contract to provide accurate answers based solely on the document.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default EnhancedContractAssistantTab;

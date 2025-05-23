
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Search, Loader, FileText, AlertTriangle, Key, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { QuestionHistoryItem } from '@/types/contract';

interface EnhancedContractAssistantTabProps {
  onAskQuestion: (question: string) => Promise<{ answer: string; sources?: string[] } | string>;
  onAnalyzeContract: (analysisType: string) => Promise<any>;
  questionHistory?: QuestionHistoryItem[];
  isProcessing?: boolean;
  contractText: string;
}

const EnhancedContractAssistantTab: React.FC<EnhancedContractAssistantTabProps> = ({ 
  onAskQuestion,
  onAnalyzeContract,
  questionHistory = [],
  isProcessing = false,
  contractText
}) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{
    summary?: any;
    risks?: any;
    keyTerms?: any;
    suggestions?: any;
  }>({});
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);

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

  const runAnalysis = async (analysisType: string) => {
    if (!contractText) {
      toast.error("No contract content available for analysis");
      return;
    }

    setActiveAnalysis(analysisType);
    setLoading(true);

    try {
      const result = await onAnalyzeContract(analysisType);
      setAnalysisResults(prev => ({
        ...prev,
        [analysisType]: result
      }));
    } catch (error) {
      toast.error(`Failed to perform ${analysisType} analysis`);
      console.error(`Error in ${analysisType} analysis:`, error);
    } finally {
      setLoading(false);
      setActiveAnalysis(null);
    }
  };

  const getAnswerText = (answer: string | { answer: string; sources?: string[] }): string => {
    if (typeof answer === 'string') {
      return answer;
    }
    return answer.answer;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="question" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="question">Q&A</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="keyTerms">Key Terms</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="question" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Ask Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              
              {answer && (
                <div className="bg-muted p-4 rounded-md mt-4">
                  <h3 className="font-medium mb-2">Answer:</h3>
                  <p className="text-sm whitespace-pre-wrap">{answer}</p>
                  
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contract Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!analysisResults.summary ? (
                <div className="text-center py-8">
                  <Button 
                    onClick={() => runAnalysis('summary')} 
                    disabled={loading || activeAnalysis === 'summary'}
                    size="lg"
                  >
                    {activeAnalysis === 'summary' ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Generating Summary...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Contract Summary
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-medium mb-2">Contract Overview:</h3>
                    <p className="text-sm whitespace-pre-wrap">{analysisResults.summary.answer}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => runAnalysis('summary')}
                    disabled={loading}
                  >
                    Regenerate Summary
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!analysisResults.risks ? (
                <div className="text-center py-8">
                  <Button 
                    onClick={() => runAnalysis('risks')} 
                    disabled={loading || activeAnalysis === 'risks'}
                    size="lg"
                  >
                    {activeAnalysis === 'risks' ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Risks...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Analyze Contract Risks
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                    <h3 className="font-medium mb-2 text-red-800">Identified Risks:</h3>
                    <p className="text-sm text-red-700 whitespace-pre-wrap">{analysisResults.risks.answer}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => runAnalysis('risks')}
                    disabled={loading}
                  >
                    Re-analyze Risks
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keyTerms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Key className="h-5 w-5" />
                Key Terms Extraction
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!analysisResults.keyTerms ? (
                <div className="text-center py-8">
                  <Button 
                    onClick={() => runAnalysis('keyTerms')} 
                    disabled={loading || activeAnalysis === 'keyTerms'}
                    size="lg"
                  >
                    {activeAnalysis === 'keyTerms' ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Extracting Key Terms...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        Extract Key Terms
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                    <h3 className="font-medium mb-2 text-blue-800">Key Terms & Clauses:</h3>
                    <p className="text-sm text-blue-700 whitespace-pre-wrap">{analysisResults.keyTerms.answer}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => runAnalysis('keyTerms')}
                    disabled={loading}
                  >
                    Re-extract Key Terms
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Contract Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!analysisResults.suggestions ? (
                <div className="text-center py-8">
                  <Button 
                    onClick={() => runAnalysis('suggestions')} 
                    disabled={loading || activeAnalysis === 'suggestions'}
                    size="lg"
                  >
                    {activeAnalysis === 'suggestions' ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Generating Suggestions...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Get Contract Suggestions
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                    <h3 className="font-medium mb-2 text-green-800">Recommendations & Improvements:</h3>
                    <p className="text-sm text-green-700 whitespace-pre-wrap">{analysisResults.suggestions.answer}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => runAnalysis('suggestions')}
                    disabled={loading}
                  >
                    Generate New Suggestions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {questionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Previous Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {questionHistory.slice(0, 5).map((item, index) => (
                <div key={index} className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm font-medium">{item.question}</p>
                  <p className="text-sm text-muted-foreground mt-1">{getAnswerText(item.answer)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-sm text-blue-700">
          All AI analyses are based on the exact contents of your contract and provided for informational purposes only. Always consult with a legal professional for important decisions.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default EnhancedContractAssistantTab;

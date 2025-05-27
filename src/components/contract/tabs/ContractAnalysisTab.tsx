
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Loader, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { QuestionHistoryItem } from '@/hooks/contract/useContractQuestionAnswer';

interface ContractAnalysisTabProps {
  onAnalyzeContract: (analysisType: string) => Promise<{ analysis: string; sources?: string[] } | null>;
  questionHistory?: QuestionHistoryItem[];
  isProcessing?: boolean;
  contractText?: string;
}

const ContractAnalysisTab: React.FC<ContractAnalysisTabProps> = ({ 
  onAnalyzeContract,
  questionHistory = [],
  isProcessing = false,
  contractText = ''
}) => {
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);
  const [currentSources, setCurrentSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [completedAnalyses, setCompletedAnalyses] = useState<Set<string>>(new Set());

  const analysisTypes = [
    { 
      id: 'risks', 
      title: 'Risk Analysis', 
      description: 'AI identifies potential risks and liabilities in your contract',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    { 
      id: 'obligations', 
      title: 'Obligations Summary', 
      description: 'AI extracts key obligations and responsibilities for each party',
      icon: FileText,
      color: 'text-blue-600'
    },
    { 
      id: 'summary', 
      title: 'Contract Summary', 
      description: 'AI generates a comprehensive overview of the entire contract',
      icon: Search,
      color: 'text-green-600'
    }
  ];

  const handleAnalysis = async (analysisType: string) => {
    if (!contractText.trim()) {
      toast.error("No document uploaded", {
        description: "Please upload a contract first to perform AI analysis"
      });
      return;
    }
    
    setLoading(true);
    setCurrentAnalysis(null);
    setCurrentSources([]);
    
    try {
      toast.info(`Starting ${analysisType} analysis...`, {
        description: "AI is analyzing your contract. This may take a moment."
      });

      const response = await onAnalyzeContract(analysisType);
      
      if (response) {
        setCurrentAnalysis(response.analysis);
        if (response.sources) {
          setCurrentSources(response.sources);
        }
        setCompletedAnalyses(prev => new Set([...prev, analysisType]));
        
        toast.success(`${analysisType} analysis completed!`, {
          description: "AI has finished analyzing your contract."
        });
      } else {
        toast.error("Analysis failed", {
          description: "The AI service couldn't complete the analysis. Please try again."
        });
      }
    } catch (error) {
      toast.error("Analysis failed", {
        description: "There was an error during analysis. Please check your connection and try again."
      });
      console.error("Error analyzing contract:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Search className="h-5 w-5" />
            AI Contract Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm text-blue-700">
              🤖 Our AI assistant will analyze your contract using advanced language models to provide insights, identify risks, and summarize key obligations.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-3">
            {analysisTypes.map((analysis) => {
              const IconComponent = analysis.icon;
              const isCompleted = completedAnalyses.has(analysis.id);
              const isCurrentlyRunning = loading && currentAnalysis === null;
              
              return (
                <Button
                  key={analysis.id}
                  variant="outline"
                  className={`h-auto p-4 justify-start transition-all ${
                    isCompleted ? 'border-green-200 bg-green-50' : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleAnalysis(analysis.id)}
                  disabled={loading || isProcessing || !contractText.trim()}
                >
                  <div className="flex items-center w-full">
                    <div className="flex items-center mr-3">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <IconComponent className={`h-5 w-5 ${analysis.color}`} />
                      )}
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {analysis.title}
                        {isCompleted && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{analysis.description}</div>
                    </div>
                    {isCurrentlyRunning && (
                      <Loader className="h-4 w-4 animate-spin ml-2" />
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
          
          {(loading || isProcessing) && (
            <div className="flex items-center gap-2 py-4 bg-blue-50 rounded-lg px-4">
              <Loader className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-700">AI is analyzing your contract...</span>
            </div>
          )}
          
          {currentAnalysis && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mt-4 border border-blue-200">
              <h3 className="font-medium mb-3 flex items-center gap-2 text-blue-900">
                <FileText className="h-4 w-4" />
                Latest AI Analysis Result:
              </h3>
              <div className="text-sm whitespace-pre-wrap text-blue-800 leading-relaxed">
                {currentAnalysis}
              </div>
              
              {currentSources && currentSources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-blue-200">
                  <p className="text-xs font-medium text-blue-700 mb-2">Analysis Sources:</p>
                  <div className="flex flex-wrap gap-1">
                    {currentSources.map((source, index) => (
                      <span key={index} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {questionHistory.length > 0 && !currentAnalysis && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Previous AI Analysis
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {questionHistory
                  .filter(item => item.type === 'analysis')
                  .slice().reverse()
                  .map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <p className="text-sm font-medium text-gray-900">{item.question}</p>
                    </div>
                    <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                      {typeof item.answer === 'string' ? item.answer : item.answer.answer}
                    </div>
                    {item.sources && item.sources.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {item.sources.map((source, sourceIndex) => (
                            <span key={sourceIndex} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
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
        </CardContent>
      </Card>
      
      <Alert className="bg-amber-50 border-amber-200">
        <AlertDescription className="text-sm text-amber-700">
          ⚖️ AI analysis is for informational purposes only and should not be considered legal advice. Always consult with a qualified legal professional for contract interpretation.
        </AlertDescription>
      </Alert>
    </>
  );
};

export default ContractAnalysisTab;

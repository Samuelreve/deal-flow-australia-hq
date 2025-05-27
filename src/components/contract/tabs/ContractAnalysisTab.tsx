
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Loader, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { QuestionHistoryItem } from '@/types/contract';

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

  const analysisTypes = [
    { 
      id: 'risks', 
      title: 'Risk Analysis', 
      description: 'Identify potential risks and liabilities',
      icon: AlertTriangle 
    },
    { 
      id: 'obligations', 
      title: 'Obligations Summary', 
      description: 'Extract key obligations for each party',
      icon: FileText 
    },
    { 
      id: 'summary', 
      title: 'Contract Summary', 
      description: 'Generate a comprehensive overview',
      icon: Search 
    }
  ];

  const handleAnalysis = async (analysisType: string) => {
    if (!contractText.trim()) {
      toast.error("No document uploaded", {
        description: "Please upload a contract first to perform analysis"
      });
      return;
    }
    
    setLoading(true);
    setCurrentAnalysis(null);
    setCurrentSources([]);
    
    try {
      const response = await onAnalyzeContract(analysisType);
      
      if (response) {
        setCurrentAnalysis(response.analysis);
        if (response.sources) {
          setCurrentSources(response.sources);
        }
      }
    } catch (error) {
      toast.error("Failed to analyze contract");
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
            Contract Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Select an analysis type to get detailed insights about your contract.
          </p>
          
          <div className="grid gap-3">
            {analysisTypes.map((analysis) => {
              const IconComponent = analysis.icon;
              return (
                <Button
                  key={analysis.id}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  onClick={() => handleAnalysis(analysis.id)}
                  disabled={loading || isProcessing || !contractText.trim()}
                >
                  <IconComponent className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{analysis.title}</div>
                    <div className="text-sm text-muted-foreground">{analysis.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
          
          {(loading || isProcessing) && (
            <div className="flex items-center gap-2 py-4">
              <Loader className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Analyzing contract...</span>
            </div>
          )}
          
          {currentAnalysis && (
            <div className="bg-muted p-4 rounded-md mt-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Analysis Result:
              </h3>
              <p className="text-sm whitespace-pre-wrap">{currentAnalysis}</p>
              
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

          {questionHistory.length > 0 && !currentAnalysis && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Previous Analysis</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {questionHistory
                  .filter(item => item.type === 'analysis')
                  .slice().reverse()
                  .map((item, index) => (
                  <div key={index} className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm font-medium mb-1">{item.question}</p>
                    <p className="text-sm text-muted-foreground">
                      {typeof item.answer === 'string' ? item.answer : item.answer.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-sm text-blue-700">
          📊 Contract analysis uses AI to identify key elements, risks, and obligations based on your uploaded document.
        </AlertDescription>
      </Alert>
    </>
  );
};

export default ContractAnalysisTab;

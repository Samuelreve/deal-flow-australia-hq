
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from 'lucide-react';
import { toast } from 'sonner';
import { QuestionHistoryItem } from '@/types/contract';
import ContractAnalysisHeader from './components/ContractAnalysisHeader';
import AnalysisTypeGrid from './components/AnalysisTypeGrid';
import AnalysisResults from './components/AnalysisResults';

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
          <CardTitle>
            <ContractAnalysisHeader />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnalysisTypeGrid
            onAnalysisSelect={handleAnalysis}
            loading={loading}
            isProcessing={isProcessing}
            completedAnalyses={completedAnalyses}
            contractText={contractText}
          />
          
          {(loading || isProcessing) && (
            <div className="flex items-center gap-2 py-4 bg-blue-50 rounded-lg px-4">
              <Loader className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-700">AI is analyzing your contract...</span>
            </div>
          )}
          
          <AnalysisResults
            currentAnalysis={currentAnalysis}
            currentSources={currentSources}
            questionHistory={questionHistory}
          />
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

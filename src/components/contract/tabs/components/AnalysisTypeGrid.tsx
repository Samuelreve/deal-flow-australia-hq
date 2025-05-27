
import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, Search, CheckCircle, Loader } from 'lucide-react';

interface AnalysisType {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface AnalysisTypeGridProps {
  onAnalysisSelect: (analysisType: string) => void;
  loading: boolean;
  isProcessing: boolean;
  completedAnalyses: Set<string>;
  contractText: string;
}

const AnalysisTypeGrid: React.FC<AnalysisTypeGridProps> = ({
  onAnalysisSelect,
  loading,
  isProcessing,
  completedAnalyses,
  contractText
}) => {
  const analysisTypes: AnalysisType[] = [
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

  return (
    <div className="grid gap-3">
      {analysisTypes.map((analysis) => {
        const IconComponent = analysis.icon;
        const isCompleted = completedAnalyses.has(analysis.id);
        const isCurrentlyRunning = loading && isProcessing;
        
        return (
          <Button
            key={analysis.id}
            variant="outline"
            className={`h-auto p-4 justify-start transition-all ${
              isCompleted ? 'border-green-200 bg-green-50' : 'hover:border-gray-300'
            }`}
            onClick={() => onAnalysisSelect(analysis.id)}
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
  );
};

export default AnalysisTypeGrid;

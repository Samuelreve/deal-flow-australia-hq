
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileSearch, 
  AlertTriangle, 
  Key, 
  TrendingUp, 
  CheckCircle,
  Loader
} from 'lucide-react';

interface AnalysisTypeGridProps {
  onAnalysisSelect: (type: string) => void;
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
  const analysisTypes = [
    {
      id: 'summary',
      title: 'Contract Summary',
      description: 'Get a comprehensive overview of the contract',
      icon: FileSearch,
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    },
    {
      id: 'risks',
      title: 'Risk Analysis',
      description: 'Identify potential risks and liabilities',
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-700 hover:bg-red-200'
    },
    {
      id: 'keyTerms',
      title: 'Key Terms',
      description: 'Extract important clauses and definitions',
      icon: Key,
      color: 'bg-green-100 text-green-700 hover:bg-green-200'
    },
    {
      id: 'suggestions',
      title: 'Improvement Suggestions',
      description: 'Get recommendations for contract improvements',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    }
  ];

  const isDisabled = loading || isProcessing || !contractText.trim();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {analysisTypes.map((type) => {
        const Icon = type.icon;
        const isCompleted = completedAnalyses.has(type.id);
        
        return (
          <Button
            key={type.id}
            variant="outline"
            className={`h-auto p-4 text-left justify-start ${type.color} border-2 relative`}
            onClick={() => onAnalysisSelect(type.id)}
            disabled={isDisabled}
          >
            <div className="flex items-start gap-3 w-full">
              <Icon className="h-6 w-6 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">{type.title}</h3>
                  {isCompleted && (
                    <Badge variant="secondary" className="h-5 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Done
                    </Badge>
                  )}
                </div>
                <p className="text-sm opacity-80">{type.description}</p>
              </div>
              {loading && (
                <Loader className="h-4 w-4 animate-spin" />
              )}
            </div>
          </Button>
        );
      })}
    </div>
  );
};

export default AnalysisTypeGrid;

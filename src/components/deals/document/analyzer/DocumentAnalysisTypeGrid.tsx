
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnalysisType } from '@/hooks/document-analysis/types';

interface DocumentAnalysisTypeGridProps {
  analysisTypes: AnalysisType[];
  onSelect: (analysisType: string) => void;
  isAnalyzing: boolean;
  currentAnalysis?: string | null;
  completedAnalyses?: string[];
}

const DocumentAnalysisTypeGrid: React.FC<DocumentAnalysisTypeGridProps> = ({
  analysisTypes,
  onSelect,
  isAnalyzing,
  currentAnalysis,
  completedAnalyses = []
}) => {
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'basic': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'legal': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'financial': return 'bg-green-50 text-green-700 border-green-200';
      case 'advanced': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {analysisTypes.map((type) => {
        const isCompleted = completedAnalyses.includes(type.id);
        const isCurrent = currentAnalysis === type.id;
        
        return (
          <Button
            key={type.id}
            variant={isCompleted ? "default" : "outline"}
            className={`h-auto p-4 justify-start text-left flex-col items-start space-y-2 ${
              isCurrent ? 'animate-pulse' : ''
            }`}
            onClick={() => onSelect(type.id)}
            disabled={isAnalyzing}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {type.icon}
                <span className="font-medium">{type.label}</span>
              </div>
              {type.category && (
                <Badge variant="outline" className={getCategoryColor(type.category)}>
                  {type.category}
                </Badge>
              )}
            </div>
            {type.description && (
              <p className="text-sm text-muted-foreground text-left">
                {type.description}
              </p>
            )}
            {isCompleted && (
              <Badge variant="secondary" className="text-xs">
                ✓ Completed
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default DocumentAnalysisTypeGrid;

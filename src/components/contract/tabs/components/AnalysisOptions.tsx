
import React from 'react';
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

const analysisOptions = [
  { id: 'summary', label: 'Summary', description: 'Get a concise summary of the contract' },
  { id: 'key_clauses', label: 'Key Clauses', description: 'Identify important clauses' },
  { id: 'obligations', label: 'Obligations', description: 'List all obligations' },
  { id: 'risks', label: 'Risks', description: 'Identify potential risks' }
];

interface AnalysisOptionsProps {
  onAnalysisSelect: (analysisType: string) => void;
  isProcessing: boolean;
}

const AnalysisOptions: React.FC<AnalysisOptionsProps> = ({
  onAnalysisSelect,
  isProcessing
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {analysisOptions.map((option) => (
        <Button
          key={option.id}
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => onAnalysisSelect(option.id)}
          disabled={isProcessing}
          title={option.description}
        >
          <Brain className="h-4 w-4" />
          <span>{option.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default AnalysisOptions;

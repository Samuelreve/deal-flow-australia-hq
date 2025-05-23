
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import DocumentAnalysisResults from '../DocumentAnalysisResults';

interface ResultPanelProps {
  analysisResult: any;
  analysisType: string;
  disclaimer: string;
  isAnalyzing: boolean;
  onBackClick: () => void;
  onSaveAnalysis: () => Promise<void>;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ 
  analysisResult, 
  analysisType, 
  disclaimer, 
  isAnalyzing,
  onBackClick,
  onSaveAnalysis
}) => {
  const [showSavedMessage, setShowSavedMessage] = useState<boolean>(false);

  const handleSave = async () => {
    await onSaveAnalysis();
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Analyzing document...</p>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No analysis results available. Please start a new analysis or select one from history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Analysis Results</h3>
        <div className="flex items-center gap-2">
          {showSavedMessage && (
            <span className="text-green-600 text-sm animate-in fade-in">
              Saved successfully!
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            Save Analysis
          </Button>
        </div>
      </div>
      
      <DocumentAnalysisResults 
        analysisType={analysisType}
        result={analysisResult}
        disclaimer={disclaimer}
        onBack={onBackClick}
      />
    </div>
  );
};

export default ResultPanel;

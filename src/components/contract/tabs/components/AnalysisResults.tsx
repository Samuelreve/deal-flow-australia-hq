
import React from 'react';
import { QuestionHistoryItem } from '@/hooks/contract/useContractQuestionAnswer';
import ProfessionalAnalysisFormatter from '../../formatting/ProfessionalAnalysisFormatter';

interface AnalysisResultsProps {
  currentAnalysis: string | null;
  currentSources: string[];
  questionHistory: QuestionHistoryItem[];
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  currentAnalysis,
  currentSources,
  questionHistory
}) => {
  if (currentAnalysis) {
    return (
      <div className="mt-6">
        <ProfessionalAnalysisFormatter
          content={currentAnalysis}
          analysisType="analysis"
          sources={currentSources}
          timestamp={Date.now()}
        />
      </div>
    );
  }

  if (questionHistory.length > 0) {
    const analysisItems = questionHistory
      .filter(item => item.type === 'analysis')
      .slice().reverse();

    if (analysisItems.length === 0) return null;

    return (
      <div className="mt-6 space-y-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Previous Analysis Reports</h3>
        {analysisItems.map((item, index) => (
          <ProfessionalAnalysisFormatter
            key={index}
            content={typeof item.answer === 'string' ? item.answer : item.answer.answer}
            analysisType={item.analysisType}
            sources={item.sources || []}
            timestamp={item.timestamp}
          />
        ))}
      </div>
    );
  }

  return null;
};

export default AnalysisResults;


import React from 'react';
import { FileText } from 'lucide-react';
import { QuestionHistoryItem } from '@/hooks/contract/useContractQuestionAnswer';

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
    );
  }

  if (questionHistory.length > 0) {
    return (
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
    );
  }

  return null;
};

export default AnalysisResults;

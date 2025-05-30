
import React from 'react';
import { MinimalLoadingSpinner } from '../../loading/ContractLoadingStates';
import { QuestionHistoryItem } from '@/types/contract';
import ProfessionalQuestionFormatter from '../../formatting/ProfessionalQuestionFormatter';

interface ConversationHistoryProps {
  questionHistory: QuestionHistoryItem[];
  isProcessing: boolean;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  questionHistory,
  isProcessing
}) => {
  if (questionHistory.length === 0 && !isProcessing) {
    return null;
  }

  const formatAnswer = (answer: string | { answer: string; sources?: string[] }) => {
    if (typeof answer === 'string') {
      return answer;
    }
    return answer.answer || 'No response available';
  };

  const getSources = (item: QuestionHistoryItem) => {
    // Handle the case where answer is an object with sources
    if (typeof item.answer === 'object' && item.answer !== null && 'sources' in item.answer) {
      return (item.answer as { sources?: string[] }).sources || [];
    }
    // Fallback to item.sources if it exists
    return item.sources || [];
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-6 px-1">
      {questionHistory.map((item, index) => (
        <ProfessionalQuestionFormatter
          key={item.id || `item-${index}`}
          question={item.question}
          answer={formatAnswer(item.answer)}
          sources={getSources(item)}
          timestamp={item.timestamp.getTime()}
        />
      ))}
      
      {isProcessing && (
        <div className="flex items-center gap-2 py-4 px-4 bg-slate-50 rounded-lg border border-slate-200">
          <MinimalLoadingSpinner size="sm" />
          <span className="text-sm text-slate-600 font-medium">Analyzing your legal inquiry...</span>
        </div>
      )}
    </div>
  );
};

export default ConversationHistory;

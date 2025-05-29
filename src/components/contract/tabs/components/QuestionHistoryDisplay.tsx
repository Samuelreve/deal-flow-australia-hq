
import React from 'react';
import { QuestionHistoryItem } from '@/types/contract';
import ProfessionalQuestionFormatter from '../../formatting/ProfessionalQuestionFormatter';

interface QuestionHistoryDisplayProps {
  questionHistory: QuestionHistoryItem[];
  currentAnswer: string | null;
  currentSources: string[];
  question: string;
}

const QuestionHistoryDisplay: React.FC<QuestionHistoryDisplayProps> = ({
  questionHistory,
  currentAnswer,
  currentSources,
  question
}) => {
  const getAnswerText = (answer: string | { answer: string; sources?: string[] }): string => {
    if (typeof answer === 'string') {
      return answer;
    }
    return answer.answer;
  };

  const getSources = (item: QuestionHistoryItem): string[] => {
    if (typeof item.answer !== 'string' && item.answer.sources) {
      return item.answer.sources;
    }
    return item.sources || [];
  };

  if (currentAnswer) {
    return (
      <div className="mb-6">
        <ProfessionalQuestionFormatter
          question={question || "Recent Question"}
          answer={currentAnswer}
          sources={currentSources}
          timestamp={Date.now()}
        />
      </div>
    );
  }

  if (questionHistory.length > 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
          Previous Legal Inquiries
        </h3>
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {questionHistory.slice().reverse().map((item, index) => (
            <ProfessionalQuestionFormatter
              key={index}
              question={item.question}
              answer={getAnswerText(item.answer)}
              sources={getSources(item)}
              timestamp={item.timestamp}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default QuestionHistoryDisplay;

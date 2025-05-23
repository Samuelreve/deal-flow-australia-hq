
import React, { useState, useRef, useEffect } from 'react';
import AnalysisOptions from './components/AnalysisOptions';
import EmptyState from './components/EmptyState';
import ConversationHistory from './components/ConversationHistory';
import QuestionInput from './components/QuestionInput';

interface HistoryItem {
  question: string;
  answer: string;
  timestamp: number;
  type: 'question' | 'analysis';
  analysisType?: string;
}

interface EnhancedContractAssistantTabProps {
  onAskQuestion: (question: string) => Promise<any>;
  onAnalyzeContract: (analysisType: string) => Promise<any>;
  questionHistory: HistoryItem[];
  isProcessing: boolean;
  contractText: string;
}

const EnhancedContractAssistantTab: React.FC<EnhancedContractAssistantTabProps> = ({
  onAskQuestion,
  onAnalyzeContract,
  questionHistory,
  isProcessing,
  contractText
}) => {
  const [question, setQuestion] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when history updates
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [questionHistory]);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    try {
      await onAskQuestion(question);
      setQuestion('');
    } catch (error) {
      console.error('Error asking question:', error);
    }
  };

  const handleAnalysisSelect = async (analysisType: string) => {
    try {
      await onAnalyzeContract(analysisType);
    } catch (error) {
      console.error('Error analyzing contract:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Analysis Options */}
      <AnalysisOptions
        onAnalysisSelect={handleAnalysisSelect}
        isProcessing={isProcessing}
      />

      {/* Empty State */}
      {questionHistory.length === 0 && !isProcessing && <EmptyState />}

      {/* Q&A History */}
      <ConversationHistory
        questionHistory={questionHistory}
        isProcessing={isProcessing}
      />
      
      <div ref={bottomRef} />

      {/* Question Input */}
      <div className="mt-auto">
        <QuestionInput
          question={question}
          onQuestionChange={setQuestion}
          onSubmit={handleAskQuestion}
          isProcessing={isProcessing}
          contractText={contractText}
        />
      </div>
    </div>
  );
};

export default EnhancedContractAssistantTab;

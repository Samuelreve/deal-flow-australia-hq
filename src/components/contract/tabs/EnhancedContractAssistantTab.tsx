
import React, { useState, useRef, useEffect } from 'react';
import AnalysisOptions from './components/AnalysisOptions';
import EmptyState from './components/EmptyState';
import ConversationHistory from './components/ConversationHistory';
import QuestionInput from './components/QuestionInput';
import { QuestionHistoryItem } from '@/hooks/contract/useContractQuestionAnswer';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from 'lucide-react';

interface EnhancedContractAssistantTabProps {
  onAskQuestion: (question: string) => Promise<any>;
  onAnalyzeContract: (analysisType: string) => Promise<any>;
  questionHistory: QuestionHistoryItem[];
  isProcessing: boolean;
  contractText: string;
  isMobile?: boolean;
}

const EnhancedContractAssistantTab: React.FC<EnhancedContractAssistantTabProps> = ({
  onAskQuestion,
  onAnalyzeContract,
  questionHistory,
  isProcessing,
  contractText,
  isMobile = false
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

  const hasContract = contractText && contractText.trim().length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* AI Info Alert */}
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          🤖 <strong>AI-Powered Assistant:</strong> Ask questions about your contract or request analysis. 
          Our AI uses advanced language models to provide detailed insights and explanations.
        </AlertDescription>
      </Alert>

      {/* Analysis Options */}
      {hasContract && (
        <AnalysisOptions
          onAnalysisSelect={handleAnalysisSelect}
          isProcessing={isProcessing}
        />
      )}

      {/* Empty State */}
      {questionHistory.length === 0 && !isProcessing && (
        <EmptyState hasContract={hasContract} />
      )}

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


import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

interface QuestionHistoryItem {
  question: string;
  answer: string | { answer: string; sources?: string[] };
  timestamp: number;
  type: 'question' | 'analysis';
}

interface QuestionPanelProps {
  questionHistory: QuestionHistoryItem[];
  isProcessing: boolean;
  onAskQuestion: (question: string) => Promise<{ answer: string; sources?: string[] }>;
  aiStatus: 'checking' | 'ready' | 'error';
}

const QuestionPanel: React.FC<QuestionPanelProps> = ({
  questionHistory,
  isProcessing,
  onAskQuestion,
  aiStatus
}) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isProcessing || aiStatus !== 'ready') return;
    
    try {
      await onAskQuestion(question);
      setQuestion('');
    } catch (error) {
      console.error('Error asking question:', error);
    }
  };

  const getStatusIcon = () => {
    switch (aiStatus) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Q&A Assistant
          {getStatusIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about this contract..."
            disabled={isProcessing || aiStatus !== 'ready'}
          />
          <Button
            type="submit"
            disabled={!question.trim() || isProcessing || aiStatus !== 'ready'}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Ask Question
              </>
            )}
          </Button>
        </form>

        {aiStatus === 'error' && (
          <div className="text-sm text-orange-600 bg-orange-50 rounded p-2">
            AI services are currently unavailable. Demo mode active.
          </div>
        )}

        {questionHistory.length > 0 && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <h4 className="font-semibold text-sm">Recent Questions</h4>
            {questionHistory.slice(-3).map((item, index) => (
              <div key={index} className="border rounded p-3 text-sm">
                <div className="font-medium mb-1">Q: {item.question}</div>
                <div className="text-muted-foreground">
                  A: {typeof item.answer === 'string' ? item.answer : item.answer.answer}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionPanel;

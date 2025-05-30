
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bot, Clock, CheckCircle } from 'lucide-react';
import { QuestionHistoryItem } from '@/types/contract';

interface QuestionHistoryDisplayProps {
  questionHistory: QuestionHistoryItem[];
  currentAnswer?: string | null;
  currentSources?: string[];
  question?: string;
}

const QuestionHistoryDisplay: React.FC<QuestionHistoryDisplayProps> = ({
  questionHistory,
  currentAnswer,
  currentSources = [],
  question
}) => {
  const formatAnswer = (answer: string) => {
    return answer;
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString();
  };

  if (questionHistory.length === 0 && !currentAnswer) {
    return null;
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <h4 className="font-semibold text-lg flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Q&A History
      </h4>
      
      {/* Current answer if processing */}
      {currentAnswer && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">{question}</p>
                  <Badge variant="secondary" className="mt-1">Latest</Badge>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-green-600 mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-sm whitespace-pre-wrap">{currentAnswer}</p>
                  </div>
                  {currentSources.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium">Sources:</p>
                      <ul className="list-disc list-inside">
                        {currentSources.map((source, index) => (
                          <li key={index}>{source}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Q&A */}
      {questionHistory.map((item, index) => (
        <Card key={item.id || index} className="border-slate-200">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-slate-600 mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{item.question}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={item.type === 'analysis' ? 'default' : 'secondary'}>
                      {item.type === 'analysis' ? 'Analysis' : 'Question'}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-green-600 mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="bg-slate-50 p-3 rounded-lg border">
                    <p className="text-sm whitespace-pre-wrap">
                      {formatAnswer(item.answer)}
                    </p>
                  </div>
                  
                  {item.sources && item.sources.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium">Sources:</p>
                      <ul className="list-disc list-inside">
                        {item.sources.map((source, sourceIndex) => (
                          <li key={sourceIndex}>{source}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuestionHistoryDisplay;

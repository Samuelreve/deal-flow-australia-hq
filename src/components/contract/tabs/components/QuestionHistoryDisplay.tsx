
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Bot, ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
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
  const allItems = [...questionHistory];
  
  // Add current processing item if exists
  if (currentAnswer && question) {
    allItems.unshift({
      id: 'current',
      question,
      answer: currentAnswer,
      timestamp: Date.now(),
      type: 'question',
      sources: currentSources
    });
  }

  if (allItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {allItems.map((item, index) => (
        <Card key={item.id || index} className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {typeof item.question === 'string' ? item.question : 'Question'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              {item.type === 'analysis' && item.analysisType && (
                <Badge variant="outline" className="text-xs">
                  {item.analysisType}
                </Badge>
              )}
            </div>
            
            <div className="mt-3 ml-7">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-slate-800 whitespace-pre-wrap">
                      {typeof item.answer === 'string' 
                        ? item.answer 
                        : typeof item.answer === 'object' && item.answer?.answer
                        ? item.answer.answer
                        : 'No answer provided'
                      }
                    </p>
                    
                    {item.sources && item.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <p className="text-xs font-medium text-slate-600 mb-1">Sources:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.sources.map((source, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
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

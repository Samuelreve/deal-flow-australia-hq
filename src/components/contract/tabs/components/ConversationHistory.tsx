
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MinimalLoadingSpinner } from '../../loading/ContractLoadingStates';
import { QuestionHistoryItem } from '@/hooks/contract/useContractQuestionAnswer';
import { Clock, MessageSquare, Search } from 'lucide-react';

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

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTypeIcon = (type: 'question' | 'analysis') => {
    return type === 'question' ? <MessageSquare className="h-4 w-4" /> : <Search className="h-4 w-4" />;
  };

  const getTypeBadgeVariant = (type: 'question' | 'analysis') => {
    return type === 'question' ? 'default' : 'secondary';
  };

  const formatAnswer = (answer: string | { answer: string; sources?: string[] }) => {
    if (typeof answer === 'string') {
      return answer;
    }
    return answer.answer || 'No response available';
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-4 px-1">
      {questionHistory.map((item, index) => (
        <Card key={item.id || `item-${index}`} className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getTypeIcon(item.type)}
                <Badge variant={getTypeBadgeVariant(item.type)} className="text-xs">
                  {item.type === 'question' ? 'Question' : 'Analysis'}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTimestamp(item.timestamp)}
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">
                  {item.type === 'question' ? 'Question:' : 'Analysis Type:'}
                </h4>
                <p className="text-sm text-muted-foreground">{item.question}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">
                  {item.type === 'question' ? 'Answer:' : 'Result:'}
                </h4>
                {item.isProcessing ? (
                  <div className="flex items-center gap-2 py-2">
                    <MinimalLoadingSpinner size="sm" />
                    <span className="text-sm text-muted-foreground">Processing...</span>
                  </div>
                ) : (
                  <div className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-md">
                    {formatAnswer(item.answer)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ConversationHistory;

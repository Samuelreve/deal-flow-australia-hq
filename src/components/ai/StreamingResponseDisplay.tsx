import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, StopCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BusinessCategoryDetector from './BusinessCategoryDetector';
import { StreamingCursor } from '@/components/ui/streaming-cursor';

interface StreamingResponseDisplayProps {
  content: string;
  category?: string;
  confidence?: number;
  isStreaming?: boolean;
  isLoading?: boolean;
  onFeedback?: (helpful: boolean) => void;
  onCancel?: () => void;
  timestamp: Date;
}

const StreamingResponseDisplay: React.FC<StreamingResponseDisplayProps> = ({
  content,
  category,
  confidence,
  isStreaming,
  isLoading,
  onFeedback,
  onCancel,
  timestamp
}) => {
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return (
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="text-sm mb-3 leading-relaxed">{children}</p>,
          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-primary">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-primary">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold mb-2 text-primary">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-semibold mb-1 text-primary">{children}</h4>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-4 text-sm">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-4 text-sm">{children}</ol>,
          li: ({ children }) => <li className="text-sm">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
          pre: ({ children }) => <pre className="bg-muted p-3 rounded-md overflow-x-auto mb-3 text-xs">{children}</pre>,
          blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/30 pl-3 italic text-muted-foreground mb-3">{children}</blockquote>,
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  // Initial loading state (no content yet)
  if (isLoading && !content) {
    return (
      <div className="flex gap-3 justify-start">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
        <div className="bg-muted rounded-lg px-4 py-3 max-w-[80%]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.1s]" />
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
            <span className="text-sm text-muted-foreground">AI is thinking...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-start">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>
      
      <div className="max-w-[85%]">
        {category && (
          <BusinessCategoryDetector 
            detectedCategory={category} 
            confidence={confidence} 
          />
        )}
        
        <Card className="bg-muted/50 border-border">
          <CardContent className="p-4">
            <div className="mb-3">
              {renderMarkdown(content)}
              {isStreaming && <StreamingCursor />}
            </div>
            
            {/* Footer */}
            <div className="border-t border-border pt-3 mt-4">
              <div className="flex items-center justify-between">
                {isStreaming && onCancel ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    className="text-destructive hover:text-destructive"
                  >
                    <StopCircle className="h-4 w-4 mr-1" />
                    Stop
                  </Button>
                ) : (
                  <div />
                )}
                <span className="text-xs text-muted-foreground">
                  {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StreamingResponseDisplay;

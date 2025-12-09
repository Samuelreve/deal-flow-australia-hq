import React from 'react';
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
  const formatResponse = (text: string) => {
    if (!text) return null;
    
    // Split by double newlines to get paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if this is a list item
      if (paragraph.startsWith('•') || paragraph.startsWith('-') || paragraph.startsWith('*')) {
        const items = paragraph.split('\n').filter(item => item.trim());
        return (
          <ul key={index} className="list-disc list-inside space-y-1 mb-4">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-sm">
                {item.replace(/^[•\-*]\s*/, '')}
              </li>
            ))}
          </ul>
        );
      }
      
      // Check if this is a numbered list
      if (/^\d+\./.test(paragraph)) {
        const items = paragraph.split('\n').filter(item => item.trim());
        return (
          <ol key={index} className="list-decimal list-inside space-y-1 mb-4">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-sm">
                {item.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        );
      }
      
      // Check if this looks like a header with **bold** markers
      if (paragraph.startsWith('**') && paragraph.includes(':**')) {
        const headerMatch = paragraph.match(/^\*\*([^*]+)\*\*/);
        if (headerMatch) {
          const headerText = headerMatch[1];
          const rest = paragraph.slice(headerMatch[0].length);
          return (
            <div key={index} className="mb-3">
              <h4 className="font-semibold text-sm text-primary mb-1">
                {headerText}
              </h4>
              {rest && (
                <p className="text-sm leading-relaxed">
                  {rest.replace(/^\s*:?\s*/, '')}
                </p>
              )}
            </div>
          );
        }
      }
      
      // Check if this looks like a section header
      if (paragraph.length < 100 && (
        paragraph.toUpperCase() === paragraph ||
        /^(Key|Important|Summary|Recommendation|Analysis|Risk|Opportunity|✅|❌|🎯|✨)/i.test(paragraph)
      )) {
        return (
          <h4 key={index} className="font-semibold text-sm mb-2 text-primary">
            {paragraph}
          </h4>
        );
      }
      
      // Regular paragraph - handle inline bold
      const formattedParagraph = paragraph.split(/(\*\*[^*]+\*\*)/).map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      
      return (
        <p key={index} className="text-sm mb-3 leading-relaxed">
          {formattedParagraph}
        </p>
      );
    });
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
              {formatResponse(content)}
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

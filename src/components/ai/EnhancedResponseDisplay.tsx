
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, CheckCircle, AlertTriangle, Info, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BusinessCategoryDetector from './BusinessCategoryDetector';

interface EnhancedResponseDisplayProps {
  content: string;
  category?: string;
  confidence?: number;
  isLoading?: boolean;
  onFeedback?: (helpful: boolean) => void;
  timestamp: Date;
}

const EnhancedResponseDisplay: React.FC<EnhancedResponseDisplayProps> = ({
  content,
  category,
  confidence,
  isLoading,
  onFeedback,
  timestamp
}) => {
  const renderMarkdown = (text: string) => {
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

  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case 'legal': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'financial': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'strategy': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-3 justify-start">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-[80%]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.1s]" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
            <span className="text-sm text-gray-600">AI is analyzing your business question...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-start">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <Bot className="h-4 w-4 text-white" />
        </div>
      </div>
      
      <div className="max-w-[85%]">
        {category && (
          <BusinessCategoryDetector 
            detectedCategory={category} 
            confidence={confidence} 
          />
        )}
        
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="mb-3">
              {renderMarkdown(content)}
            </div>
            
            {/* Footer with just timestamp */}
            <div className="border-t pt-3 mt-4">
              <div className="flex items-center justify-end">
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

export default EnhancedResponseDisplay;

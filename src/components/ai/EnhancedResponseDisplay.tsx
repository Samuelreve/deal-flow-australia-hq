
import React from 'react';
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
  const formatResponse = (text: string) => {
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
      
      // Check if this looks like a header (all caps or starts with specific words)
      if (paragraph.length < 100 && (
        paragraph.toUpperCase() === paragraph ||
        /^(Key|Important|Summary|Recommendation|Analysis|Risk|Opportunity)/i.test(paragraph)
      )) {
        return (
          <h4 key={index} className="font-semibold text-sm mb-2 text-primary">
            {paragraph}
          </h4>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="text-sm mb-3 leading-relaxed">
          {paragraph}
        </p>
      );
    });
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
              {formatResponse(content)}
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

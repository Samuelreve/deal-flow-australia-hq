
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, Users, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface SummaryRendererProps {
  content: any;
}

const SummaryRenderer: React.FC<SummaryRendererProps> = ({ content }) => {
  const { summary, keyPoints = [], documentType, wordCount, disclaimer } = content;

  // Clean and format summary text professionally
  const cleanSummary = (text: string) => {
    if (!text) return '';
    
    return text
      // Remove all markdown headers (###, ##, #)
      .replace(/#{1,6}\s*/g, '')
      // Remove all bold/italic markdown formatting (**text**, *text*, ***text***)
      .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, '$1')
      // Remove standalone asterisks and dashes
      .replace(/^\s*[\*\-•]+\s*/gm, '')
      // Remove bullet point markers at start of lines
      .replace(/^\s*[-*•]\s+/gm, '')
      // Remove horizontal rules and separators
      .replace(/^-{3,}$/gm, '')
      .replace(/^={3,}$/gm, '')
      // Clean up any remaining asterisks or markdown symbols
      .replace(/\*+/g, '')
      .replace(/\-{2,}/g, '')
      // Remove any remaining hash symbols
      .replace(/#/g, '')
      // Clean up multiple spaces and newlines
      .replace(/\s{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      // Ensure proper spacing after periods and colons
      .replace(/([.:])\s*\n/g, '$1\n\n')
      .trim();
  };

  return (
    <div className="space-y-6">
      {/* Clean Summary Display */}
      {(summary || (keyPoints && keyPoints.length > 0)) && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Document Summary</h3>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {documentType}
                  </Badge>
                  {wordCount && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {wordCount.toLocaleString()} words
                    </Badge>
                  )}
                </div>
                
                {/* Display clean summary text */}
                {summary && (
                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-line mb-4">
                    {cleanSummary(summary)}
                  </div>
                )}
                
                {/* Display key points if no summary text */}
                {!summary && keyPoints && keyPoints.length > 0 && (
                  <ul className="space-y-2">
                    {keyPoints.map((point: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      {disclaimer && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                {disclaimer}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SummaryRenderer;

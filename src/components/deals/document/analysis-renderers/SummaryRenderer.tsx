
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface SummaryRendererProps {
  content: any;
}

const SummaryRenderer: React.FC<SummaryRendererProps> = ({ content }) => {
  const { summary, keyPoints = [], documentType, wordCount, disclaimer } = content;

  return (
    <div className="space-y-6">
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
                
                {summary && (
                  <div className="prose prose-sm max-w-none dark:prose-invert mb-4">
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  </div>
                )}
                
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

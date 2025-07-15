import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, Users, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface ContractSummaryRendererProps {
  content: any;
}

const ContractSummaryRenderer: React.FC<ContractSummaryRendererProps> = ({ content }) => {
  const { summary, keyPoints = [], documentType = "Contract", wordCount, disclaimer } = content;

  // Clean summary text by removing markdown formatting
  const cleanSummary = (text: string) => {
    if (!text) return '';
    return text
      .replace(/#{1,6}\s+/g, '') // Remove # headers
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1') // Remove * formatting
      .replace(/^\s*-\s+/gm, '') // Remove bullet points
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
      .trim();
  };

  return (
    <div className="space-y-6">
      {/* AI-Generated Contract Summary */}
      {(summary || (keyPoints && keyPoints.length > 0)) && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">AI Contract Analysis</h3>
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
                
                {/* Display key points if available */}
                {keyPoints && keyPoints.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Key Points:</h4>
                    <ul className="space-y-2">
                      {keyPoints.map((point: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-foreground">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Disclaimer */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              {disclaimer || "This AI analysis is for informational purposes only and should not be considered legal advice. Always consult with a qualified attorney for legal matters."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractSummaryRenderer;
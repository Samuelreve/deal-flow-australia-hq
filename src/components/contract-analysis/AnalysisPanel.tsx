
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Download, Loader2 } from "lucide-react";
import { DocumentHighlight } from '@/types/contract';

interface AnalysisPanelProps {
  summaryData: any;
  isAnalyzing: boolean;
  exportHighlightsToCSV: () => void;
  documentHighlights: DocumentHighlight[];
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  summaryData,
  isAnalyzing,
  exportHighlightsToCSV,
  documentHighlights
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAnalyzing ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing contract...
          </div>
        ) : summaryData ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Summary</h4>
              <div className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground">
                <ReactMarkdown>{summaryData.summary || "Analysis complete. Key insights have been identified."}</ReactMarkdown>
              </div>
            </div>
            
            {summaryData.keyTerms && (
              <div>
                <h4 className="font-semibold mb-2">Key Terms</h4>
                <div className="space-y-1">
                  {summaryData.keyTerms.slice(0, 3).map((term: string, index: number) => (
                    <div key={index} className="text-sm bg-primary/10 rounded px-2 py-1">
                      {term}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summaryData.risks && (
              <div>
                <h4 className="font-semibold mb-2">Identified Risks</h4>
                <div className="space-y-1">
                  {summaryData.risks.slice(0, 2).map((risk: string, index: number) => (
                    <div key={index} className="text-sm bg-destructive/10 rounded px-2 py-1 text-destructive">
                      {risk}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Upload a contract to see AI-powered analysis and insights.
          </p>
        )}

        {documentHighlights.length > 0 && (
          <Button
            onClick={exportHighlightsToCSV}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Highlights
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisPanel;

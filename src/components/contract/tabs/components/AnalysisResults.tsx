
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink } from 'lucide-react';
import { QuestionHistoryItem } from '@/types/contract';

interface AnalysisResultsProps {
  currentAnalysis?: string | null;
  currentSources?: string[];
  questionHistory: QuestionHistoryItem[];
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  currentAnalysis,
  currentSources = [],
  questionHistory
}) => {
  if (currentAnalysis) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <FileText className="h-5 w-5" />
            Analysis Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert text-green-900">
            <ReactMarkdown>{currentAnalysis}</ReactMarkdown>
          </div>
          
          {currentSources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <h4 className="text-sm font-medium text-green-800 mb-2">Sources:</h4>
              <div className="flex flex-wrap gap-2">
                {currentSources.map((source, index) => (
                  <Badge key={index} variant="outline" className="text-green-700 border-green-300">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const recentAnalysis = questionHistory
    .filter(item => item.type === 'analysis')
    .slice(0, 3);

  if (recentAnalysis.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Recent Analysis Results</h3>
      {recentAnalysis.map((item, index) => (
        <Card key={item.id || index} className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              {item.analysisType || 'Analysis'}
              <Badge variant="outline" className="ml-auto">
                {new Date(item.timestamp).toLocaleDateString()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert text-slate-700">
              <ReactMarkdown>
                {typeof item.answer === 'string' 
                  ? item.answer.substring(0, 300) + (item.answer.length > 300 ? '...' : '')
                  : 'Analysis completed'
                }
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalysisResults;

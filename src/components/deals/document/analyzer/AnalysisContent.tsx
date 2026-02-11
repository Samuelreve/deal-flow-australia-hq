
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AnalysisContentProps {
  analysisType: string;
  result: any;
  loading: boolean;
  inProgress: boolean;
}

const AnalysisContent: React.FC<AnalysisContentProps> = ({
  analysisType,
  result,
  loading,
  inProgress
}) => {
  if (!result && !loading && !inProgress) {
    return (
      <Alert className="bg-muted/50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Select an analysis type from above to analyze this document.
        </AlertDescription>
      </Alert>
    );
  }

  if (result) {
    if (typeof result === 'string') {
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      );
    }
    
    if (result.content) {
      if (typeof result.content === 'string') {
        return (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{result.content}</ReactMarkdown>
          </div>
        );
      } else {
        return (
          <div>
            {result.content.summary && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Summary</h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{result.content.summary}</ReactMarkdown>
                </div>
              </div>
            )}
            
            {result.content.details && result.content.details.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Details</h3>
                <ul className="space-y-2">
                  {result.content.details.map((item: any, index: number) => (
                    <li key={index} className="p-3 bg-muted/50 rounded">
                      {item.title && <div className="font-medium">{item.title}</div>}
                      {item.description && (
                        <div className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground">
                          <ReactMarkdown>{item.description}</ReactMarkdown>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      }
    }
    
    return <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>;
  }

  return null;
};

export default AnalysisContent;

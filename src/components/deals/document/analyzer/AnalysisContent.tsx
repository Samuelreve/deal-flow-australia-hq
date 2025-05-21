
import React from 'react';
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

  // Display analysis results based on the type
  if (result) {
    // If result is a string, display it directly
    if (typeof result === 'string') {
      return <div className="whitespace-pre-line">{result}</div>;
    }
    
    // If result is an object with content property
    if (result.content) {
      if (typeof result.content === 'string') {
        return <div className="whitespace-pre-line">{result.content}</div>;
      } else {
        // Render structured content
        return (
          <div>
            {result.content.summary && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Summary</h3>
                <p className="text-muted-foreground">{result.content.summary}</p>
              </div>
            )}
            
            {result.content.details && result.content.details.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Details</h3>
                <ul className="space-y-2">
                  {result.content.details.map((item: any, index: number) => (
                    <li key={index} className="p-3 bg-muted/50 rounded">
                      {item.title && <div className="font-medium">{item.title}</div>}
                      {item.description && <div className="text-muted-foreground">{item.description}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      }
    }
    
    // Fallback for any other result structure
    return <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>;
  }

  // This shouldn't be reached as loading states should be handled by the parent component
  return null;
};

export default AnalysisContent;

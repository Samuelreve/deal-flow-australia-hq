
import React from 'react';

interface AIResultDisplayProps {
  result: any;
  disclaimer: string;
  error: string | null;
}

const AIResultDisplay: React.FC<AIResultDisplayProps> = ({ result, disclaimer, error }) => {
  if (!result && !error) return null;

  return (
    <>
      {result && (
        <div className="mt-4 border rounded-lg p-4 bg-muted/20 space-y-4 max-h-[300px] overflow-y-auto">
          <h4 className="font-medium">AI Analysis Result</h4>
          
          {/* Display different result types based on properties */}
          {result.summary && (
            <div className="whitespace-pre-wrap text-sm">{result.summary}</div>
          )}
          
          {result.prediction && (
            <div className="whitespace-pre-wrap text-sm">{result.prediction}</div>
          )}
          
          {result.summaryText && (
            <div className="whitespace-pre-wrap text-sm">{result.summaryText}</div>
          )}
          
          {result.explanation && (
            <div className="whitespace-pre-wrap text-sm">{result.explanation}</div>
          )}
          
          {disclaimer && (
            <p className="text-xs text-muted-foreground italic border-t pt-2">
              {disclaimer}
            </p>
          )}
        </div>
      )}
      
      {error && (
        <div className="mt-4 border border-destructive/50 rounded-lg p-4 bg-destructive/10">
          <p className="text-sm text-destructive font-medium">Error: {error}</p>
        </div>
      )}
    </>
  );
};

export default AIResultDisplay;

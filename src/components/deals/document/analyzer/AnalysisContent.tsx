
import React from 'react';
import { AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnalysisContentProps {
  analysisType: string;
  result: any | null;
  loading: boolean;
  inProgress: boolean;
}

const AnalysisContent: React.FC<AnalysisContentProps> = ({
  analysisType,
  result,
  loading,
  inProgress
}) => {
  if (loading || inProgress) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground mb-2">Analyzing document...</p>
      </div>
    );
  }
  
  if (!result) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Analysis not available. Please try again.</p>
      </div>
    );
  }
  
  switch (analysisType) {
    case 'summarize_contract':
      return (
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap">{result.content.summary}</p>
        </div>
      );
      
    case 'key_clauses':
      return (
        <div className="space-y-4">
          {Array.isArray(result.content) ? result.content.map((clause, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  {clause.heading}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <p className="text-sm text-muted-foreground">{clause.summary}</p>
                {clause.location && (
                  <Badge variant="outline" className="mt-2">
                    Page {clause.location}
                  </Badge>
                )}
              </CardContent>
            </Card>
          )) : (
            <p>No key clauses identified.</p>
          )}
        </div>
      );
      
    case 'risk_identification':
      return (
        <div className="space-y-4">
          {Array.isArray(result.content) ? result.content.map((risk, index) => (
            <Card key={index} className="border-l-4 border-l-amber-400">
              <CardHeader className="py-3">
                <CardTitle className="text-base flex gap-2 items-center">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  {risk.risk}
                </CardTitle>
                {risk.severity && (
                  <Badge 
                    variant={risk.severity === "High" ? "destructive" : 
                            risk.severity === "Medium" ? "warning" : "outline"}
                    className="ml-auto"
                  >
                    {risk.severity}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <p className="text-sm my-1">Location: {risk.location || 'Not specified'}</p>
                <p className="text-sm text-muted-foreground">{risk.explanation}</p>
              </CardContent>
            </Card>
          )) : (
            <p>No risks identified.</p>
          )}
        </div>
      );
      
    default:
      // For other analysis types, render a generic view
      return (
        <div>
          <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(result.content, null, 2)}
          </pre>
        </div>
      );
  }
};

export default AnalysisContent;

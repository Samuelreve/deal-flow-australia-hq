
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, FileText, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ContractSummaryTabProps {
  documentSummary: any;
  isAnalyzing: boolean;
}

const ContractSummaryTab: React.FC<ContractSummaryTabProps> = ({ 
  documentSummary, 
  isAnalyzing 
}) => {
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Analyzing document...</p>
      </div>
    );
  }
  
  if (!documentSummary) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No document uploaded yet. Please upload a contract to see the summary.
        </p>
      </div>
    );
  }

  const getIcon = () => {
    switch (documentSummary.category) {
      case 'CONTRACT':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'FINANCIAL':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'IRRELEVANT':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-blue-600" />;
    }
  };

  const getCardClassName = () => {
    switch (documentSummary.category) {
      case 'CONTRACT':
        return 'border-green-200 bg-green-50';
      case 'FINANCIAL':
        return 'border-amber-200 bg-amber-50';
      case 'IRRELEVANT':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="space-y-4">
      <Card className={getCardClassName()}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {getIcon()}
            Document Analysis Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg mb-2">{documentSummary.title}</h3>
              <p className="text-sm">{documentSummary.message}</p>
            </div>
            
            {documentSummary.keyPoints && documentSummary.keyPoints.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Key Points:</h4>
                <ul className="space-y-1">
                  {documentSummary.keyPoints.map((point: string, index: number) => (
                    <li key={index} className="text-sm">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Show detailed contract information if it's a valid contract */}
            {documentSummary.category === 'CONTRACT' && (
              <div className="space-y-3 mt-4 pt-4 border-t border-green-200">
                {documentSummary.contractType && (
                  <div>
                    <h4 className="font-medium text-sm">Contract Type:</h4>
                    <p className="text-sm text-muted-foreground">{documentSummary.contractType}</p>
                  </div>
                )}
                
                {documentSummary.parties && (
                  <div>
                    <h4 className="font-medium text-sm">Parties:</h4>
                    <p className="text-sm text-muted-foreground">{documentSummary.parties}</p>
                  </div>
                )}
                
                {documentSummary.obligations && documentSummary.obligations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm">Key Obligations:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {documentSummary.obligations.map((obligation: string, index: number) => (
                        <li key={index}>• {obligation}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {documentSummary.termination && (
                  <div>
                    <h4 className="font-medium text-sm">Termination:</h4>
                    <p className="text-sm text-muted-foreground">{documentSummary.termination}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground pt-2">
              Analyzed on {new Date(documentSummary.analysisDate).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {documentSummary.category === 'CONTRACT' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-sm text-blue-800">
              <strong>💡 What you can do next:</strong>
              <ul className="mt-2 space-y-1 ml-4">
                <li>• Use the "Ask Questions" tab to get specific answers about this contract</li>
                <li>• Use the "Analysis" tab for detailed risk and compliance analysis</li>
                <li>• All answers will be based solely on the content of your uploaded document</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContractSummaryTab;

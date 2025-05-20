
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ChevronLeft } from "lucide-react";

interface DocumentAnalysisResultsProps {
  analysisType: string;
  result: {
    type: string;
    content: any;
  };
  disclaimer: string;
  onBack: () => void;
}

const DocumentAnalysisResults: React.FC<DocumentAnalysisResultsProps> = ({
  analysisType,
  result,
  disclaimer,
  onBack
}) => {
  const renderKeyClauses = (content: any) => {
    if (!Array.isArray(content)) return <p>No key clauses identified.</p>;
    
    return (
      <div className="space-y-3">
        {content.map((clause, index) => (
          <div key={index} className="border-b pb-2">
            <h4 className="font-medium">{clause.heading}</h4>
            <p className="text-sm text-muted-foreground">{clause.summary}</p>
          </div>
        ))}
      </div>
    );
  };
  
  const renderRisks = (content: any) => {
    if (!Array.isArray(content)) return <p>No risks identified.</p>;
    
    return (
      <div className="space-y-3">
        {content.map((risk, index) => (
          <div key={index} className="border-b pb-3">
            <div className="flex gap-2 items-center">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h4 className="font-medium">{risk.risk}</h4>
            </div>
            <p className="text-sm my-1">Location: {risk.location || 'Not specified'}</p>
            <p className="text-sm text-muted-foreground">{risk.explanation}</p>
          </div>
        ))}
      </div>
    );
  };
  
  const renderFinancialSummary = (content: any) => {
    if (!content) return <p>No financial summary available.</p>;
    
    return (
      <div className="space-y-4">
        {content.summary && (
          <div>
            <h4 className="font-medium mb-2">Summary</h4>
            <p>{content.summary}</p>
          </div>
        )}
        
        {content.risks && content.risks.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Identified Risks</h4>
            <ul className="list-disc pl-5 space-y-1">
              {content.risks.map((risk: string, index: number) => (
                <li key={index} className="text-sm">{risk}</li>
              ))}
            </ul>
          </div>
        )}
        
        {content.opportunities && content.opportunities.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Opportunities</h4>
            <ul className="list-disc pl-5 space-y-1">
              {content.opportunities.map((opportunity: string, index: number) => (
                <li key={index} className="text-sm">{opportunity}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  const renderGeneralAnalysis = (content: any) => {
    if (!content) return <p>No analysis available.</p>;
    
    return (
      <div className="space-y-4">
        {content.summary && (
          <div>
            <h4 className="font-medium mb-2">Summary</h4>
            <p>{content.summary}</p>
          </div>
        )}
        
        {content.key_points && content.key_points.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Key Points</h4>
            <ul className="list-disc pl-5 space-y-1">
              {content.key_points.map((point: string, index: number) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderAnalysisResult = () => {
    const content = result.content;
    
    switch (analysisType) {
      case 'key_clauses':
        return renderKeyClauses(content);
      case 'risk_identification':
        return renderRisks(content);
      case 'financial_summary':
        return renderFinancialSummary(content);
      case 'general':
      default:
        return renderGeneralAnalysis(content);
    }
  };

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        className="flex items-center gap-1 px-2" 
        onClick={onBack}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to analysis types
      </Button>
      
      <div>
        {renderAnalysisResult()}
      </div>
      
      <Alert className="bg-muted/50">
        <AlertDescription className="text-xs text-muted-foreground">
          {disclaimer || "This is an AI-generated analysis and should be reviewed by a professional. The analysis may not be complete or accurate."}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DocumentAnalysisResults;


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
  
  const renderLegalCompliance = (content: any) => {
    if (!content || !content.considerations) {
      return <p>No compliance considerations identified.</p>;
    }
    
    return (
      <div className="space-y-4">
        {content.summary && (
          <div>
            <h4 className="font-medium mb-2">Summary</h4>
            <p>{content.summary}</p>
          </div>
        )}
        
        <div>
          <h4 className="font-medium mb-2">Compliance Considerations</h4>
          <div className="space-y-3">
            {content.considerations.map((item: any, index: number) => (
              <div key={index} className="border-b pb-2">
                <h5 className="font-medium">{item.area}</h5>
                <p className="text-sm text-muted-foreground">{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const renderObligations = (content: any) => {
    if (!content || !content.obligations) {
      return <p>No obligations identified.</p>;
    }
    
    return (
      <div className="space-y-4">
        {content.summary && (
          <div>
            <h4 className="font-medium mb-2">Summary</h4>
            <p>{content.summary}</p>
          </div>
        )}
        
        <div>
          <h4 className="font-medium mb-2">Obligations & Commitments</h4>
          <div className="space-y-3">
            {content.obligations.map((item: any, index: number) => (
              <div key={index} className="border-b pb-2">
                <div className="flex justify-between">
                  <h5 className="font-medium">{item.party}</h5>
                  {item.deadline && (
                    <span className="text-sm text-blue-600">{item.deadline}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{item.obligation}</p>
                {item.section && (
                  <p className="text-xs text-muted-foreground mt-1">Section: {item.section}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const renderFinancialTerms = (content: any) => {
    if (!content || !content.terms) {
      return <p>No financial terms identified.</p>;
    }
    
    return (
      <div className="space-y-4">
        {content.summary && (
          <div>
            <h4 className="font-medium mb-2">Summary</h4>
            <p>{content.summary}</p>
          </div>
        )}
        
        <div>
          <h4 className="font-medium mb-2">Financial Terms</h4>
          <div className="space-y-3">
            {content.terms.map((item: any, index: number) => (
              <div key={index} className="border-b pb-2">
                <h5 className="font-medium">{item.category}</h5>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                {item.amount && (
                  <p className="text-sm font-medium text-green-600 mt-1">{item.amount}</p>
                )}
                {item.section && (
                  <p className="text-xs text-muted-foreground mt-1">Section: {item.section}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const renderSummarizeContract = (content: any) => {
    return (
      <div className="prose prose-sm max-w-none">
        <p className="whitespace-pre-wrap">{content.summary}</p>
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
      case 'legal_compliance':
        return renderLegalCompliance(content);
      case 'obligations_analysis':
        return renderObligations(content);
      case 'financial_terms':
        return renderFinancialTerms(content);
      case 'summarize_contract':
        return renderSummarizeContract(content);
      default:
        // For other analysis types, render a generic view
        return (
          <div>
            <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(content, null, 2)}
            </pre>
          </div>
        );
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

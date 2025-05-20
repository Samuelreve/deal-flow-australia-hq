
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface DocumentAnalysisTypeSelectorProps {
  onSelect: (type: string) => void;
  isAnalyzing: boolean;
}

const DocumentAnalysisTypeSelector: React.FC<DocumentAnalysisTypeSelectorProps> = ({
  onSelect,
  isAnalyzing
}) => {
  const analysisTypes: AnalysisType[] = [
    {
      id: 'key_clauses',
      title: 'Key Clauses Extraction',
      description: 'Extract and summarize the most important clauses in this document',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    },
    {
      id: 'risk_identification',
      title: 'Risk Identification',
      description: 'Identify potential risks, liabilities, or unfavorable terms',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
    },
    {
      id: 'financial_summary',
      title: 'Financial Summary',
      description: 'Summarize key financial information, risks, and opportunities',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
    },
    {
      id: 'general',
      title: 'General Analysis',
      description: 'Perform a comprehensive analysis of the document content',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      {analysisTypes.map((type) => (
        <Card key={type.id} className="hover:shadow-md transition-all cursor-pointer">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              {type.icon}
            </div>
            <CardTitle className="text-lg">{type.title}</CardTitle>
            <CardDescription>{type.description}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => onSelect(type.id)} 
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                `Analyze`
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
      
      <div className="col-span-1 md:col-span-2 mt-4">
        <p className="text-sm text-muted-foreground">
          Note: Document analysis may take up to 30 seconds depending on document size and complexity.
          The AI will analyze the content and provide insights based on the selected analysis type.
        </p>
      </div>
    </div>
  );
};

export default DocumentAnalysisTypeSelector;

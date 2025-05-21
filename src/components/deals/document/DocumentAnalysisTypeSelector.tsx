
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, AlertTriangle, Scale, FileSearch, FileCode, FileSpreadsheet, Landmark, BookOpen } from "lucide-react";

interface DocumentAnalysisTypeSelectorProps {
  onSelect: (type: string) => void;
  isAnalyzing: boolean;
}

interface AnalysisOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const DocumentAnalysisTypeSelector: React.FC<DocumentAnalysisTypeSelectorProps> = ({
  onSelect,
  isAnalyzing
}) => {
  // Define available analysis types
  const analysisOptions: AnalysisOption[] = [
    {
      id: 'summarize_contract',
      title: 'Contract Summary',
      description: 'Get a concise summary of the main points in the document',
      icon: <FileText className="h-8 w-8 text-blue-500" />
    },
    {
      id: 'key_clauses',
      title: 'Key Clauses',
      description: 'Extract and explain the key clauses in the document',
      icon: <BookOpen className="h-8 w-8 text-emerald-500" />
    },
    {
      id: 'risk_identification',
      title: 'Risk Analysis',
      description: 'Identify potential risks and liabilities in the document',
      icon: <AlertTriangle className="h-8 w-8 text-amber-500" />
    },
    {
      id: 'legal_compliance',
      title: 'Legal Compliance',
      description: 'Check for basic legal compliance issues and considerations',
      icon: <Landmark className="h-8 w-8 text-indigo-500" />
    },
    {
      id: 'obligations_analysis',
      title: 'Obligations & Commitments',
      description: 'Identify key obligations, commitments, and dates',
      icon: <Scale className="h-8 w-8 text-violet-500" />
    },
    {
      id: 'financial_terms',
      title: 'Financial Terms',
      description: 'Extract and analyze financial terms and conditions',
      icon: <FileSpreadsheet className="h-8 w-8 text-green-500" />
    },
    {
      id: 'technical_specification',
      title: 'Technical Analysis',
      description: 'Analyze technical specifications and requirements',
      icon: <FileCode className="h-8 w-8 text-cyan-500" />
    },
    {
      id: 'general',
      title: 'General Analysis',
      description: 'Perform a comprehensive analysis of the document',
      icon: <FileSearch className="h-8 w-8 text-gray-500" />
    }
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Select Analysis Type</h2>
      
      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Analyzing document...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysisOptions.map((option) => (
            <Card
              key={option.id}
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors flex flex-col h-full"
              onClick={() => onSelect(option.id)}
            >
              <div className="flex items-start space-x-4">
                <div className="shrink-0 mt-1">{option.icon}</div>
                <div>
                  <h3 className="font-medium">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentAnalysisTypeSelector;

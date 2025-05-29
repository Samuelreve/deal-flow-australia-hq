
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, AlertTriangle, CheckCircle, Scale, Clock } from 'lucide-react';

interface ProfessionalAnalysisFormatterProps {
  content: string;
  analysisType?: string;
  sources?: string[];
  timestamp?: number;
}

const ProfessionalAnalysisFormatter: React.FC<ProfessionalAnalysisFormatterProps> = ({
  content,
  analysisType,
  sources,
  timestamp
}) => {
  const formatAnalysisContent = (text: string) => {
    // Split content into sections and format professionally
    const sections = text.split(/\n\s*\n/);
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      if (!trimmedSection) return null;

      // Check if this is a header (usually shorter and may contain keywords)
      if (trimmedSection.length < 100 && (
        /^(EXECUTIVE SUMMARY|SUMMARY|ANALYSIS|FINDINGS|RECOMMENDATIONS|CONCLUSION|OVERVIEW|KEY TERMS|OBLIGATIONS|RISKS|PARTIES|TERMINATION|PAYMENT|LIABILITY|COMPLIANCE)/i.test(trimmedSection) ||
        /^[A-Z\s]+:?\s*$/.test(trimmedSection) ||
        trimmedSection.endsWith(':')
      )) {
        return (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-600" />
              {trimmedSection.replace(/^[:\s]+|[:\s]+$/g, '')}
            </h3>
          </div>
        );
      }

      // Check if this is a numbered or bulleted list
      if (/^\d+\.|^[•\-\*]/.test(trimmedSection)) {
        const listItems = trimmedSection.split('\n').filter(item => item.trim());
        return (
          <div key={index} className="mb-6">
            <ul className="space-y-3">
              {listItems.map((item, itemIndex) => {
                const cleanItem = item.replace(/^\d+\.\s*|^[•\-\*]\s*/, '').trim();
                return (
                  <li key={itemIndex} className="flex items-start gap-3 text-slate-700 leading-relaxed">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                    <span className="text-sm">{cleanItem}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      }

      // Regular paragraph - format with proper legal document styling
      return (
        <div key={index} className="mb-4">
          <p className="text-slate-700 leading-relaxed text-sm text-justify indent-4 font-light">
            {trimmedSection}
          </p>
        </div>
      );
    }).filter(Boolean);
  };

  const getAnalysisIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'risks':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'obligations':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'summary':
        return <FileText className="h-5 w-5 text-blue-600" />;
      default:
        return <Scale className="h-5 w-5 text-slate-600" />;
    }
  };

  const getAnalysisTitle = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'risks':
        return 'Risk Assessment & Legal Analysis';
      case 'obligations':
        return 'Contractual Obligations & Responsibilities';
      case 'summary':
        return 'Executive Summary & Contract Overview';
      default:
        return 'Legal Analysis Report';
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            {getAnalysisIcon(analysisType)}
            <div>
              <h2 className="text-xl font-bold">{getAnalysisTitle(analysisType)}</h2>
              {analysisType && (
                <p className="text-sm font-normal text-slate-600 mt-1">
                  Professional Legal Document Analysis
                </p>
              )}
            </div>
          </CardTitle>
          {timestamp && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="h-4 w-4" />
              {new Date(timestamp).toLocaleString()}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        <div className="prose prose-slate max-w-none">
          {formatAnalysisContent(content)}
        </div>
        
        {sources && sources.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Referenced Document Sections
              </h4>
              <div className="flex flex-wrap gap-2">
                {sources.map((source, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-slate-200 text-slate-700">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
        
        <Separator className="my-6" />
        
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Scale className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-semibold mb-1">Legal Disclaimer</p>
              <p className="leading-relaxed">
                This analysis is generated by artificial intelligence and is provided for informational purposes only. 
                It does not constitute legal advice and should not be relied upon for legal decisions. 
                Always consult with a qualified attorney for professional legal guidance regarding contract interpretation and obligations.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalAnalysisFormatter;

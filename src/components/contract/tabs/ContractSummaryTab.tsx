
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, InfoIcon, FileText } from 'lucide-react';

export interface SummaryItem {
  title: string;
  content: string;
}

interface SummaryData {
  summary: SummaryItem[];
  disclaimer: string;
}

export interface ContractSummaryTabProps {
  summaryData?: SummaryData;
  customSummary?: any;
  mockSummary?: any;
}

const ContractSummaryTab: React.FC<ContractSummaryTabProps> = ({ 
  summaryData,
  customSummary,
  mockSummary
}) => {
  // Use customSummary or mockSummary if summaryData is not provided
  const displayData = summaryData || customSummary?.summary ? 
    { 
      summary: customSummary?.summary || [],
      disclaimer: customSummary?.disclaimer || mockSummary?.disclaimer || "This is an AI-generated summary and may not cover all legal details. Always consult with a legal professional."
    } 
    : mockSummary;
  
  if (!displayData || !displayData.summary || displayData.summary.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm text-blue-700">
              No summary is available for this contract. Try uploading a document to generate a summary.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contract Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {displayData.summary.map((item, index) => (
          <div key={index} className="space-y-1 border-b pb-4 last:border-b-0">
            <h3 className="text-base font-medium text-gray-800">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.content}</p>
          </div>
        ))}
        
        <Alert className="bg-amber-50 border-amber-200 mt-6">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm text-amber-700">
            {displayData.disclaimer}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ContractSummaryTab;

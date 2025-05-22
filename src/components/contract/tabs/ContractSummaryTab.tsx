
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, InfoIcon } from 'lucide-react';

export interface SummaryItem {
  title: string;
  content: string;
}

interface SummaryData {
  summary: SummaryItem[];
  disclaimer: string;
}

interface ContractSummaryTabProps {
  summaryData: SummaryData;
}

const ContractSummaryTab: React.FC<ContractSummaryTabProps> = ({ summaryData }) => {
  if (!summaryData || !summaryData.summary || summaryData.summary.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Contract Summary</CardTitle>
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
        <CardTitle className="text-xl">Contract Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {summaryData.summary.map((item, index) => (
          <div key={index} className="space-y-1">
            <h3 className="text-base font-medium">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.content}</p>
          </div>
        ))}
        
        <Alert className="bg-amber-50 border-amber-200 mt-6">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm text-amber-700">
            {summaryData.disclaimer}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ContractSummaryTab;

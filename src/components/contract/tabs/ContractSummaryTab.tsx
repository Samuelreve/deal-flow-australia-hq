
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

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

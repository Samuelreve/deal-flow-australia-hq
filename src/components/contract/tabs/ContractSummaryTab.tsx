
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, Database } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface DocumentSummary {
  category: string;
  title: string;
  message: string;
}

interface ContractSummaryTabProps {
  documentSummary?: DocumentSummary | null;
  isAnalyzing?: boolean;
}

const ContractSummaryTab: React.FC<ContractSummaryTabProps> = ({
  documentSummary,
  isAnalyzing = false
}) => {
  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Analyzing document...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!documentSummary) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Document Uploaded</h3>
          <p className="text-muted-foreground">
            Upload a contract document to see its summary and analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CONTRACT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'FINANCIAL':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Document Type:</span>
            <Badge className={getCategoryColor(documentSummary.category)}>
              {documentSummary.category}
            </Badge>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">{documentSummary.title}</h4>
            <p className="text-sm text-muted-foreground">
              {documentSummary.message}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Analysis Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">AI Q&A Assistant</span>
              <Badge variant={documentSummary.category === 'CONTRACT' ? 'default' : 'secondary'}>
                {documentSummary.category === 'CONTRACT' ? 'Available' : 'Limited'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Contract Analysis</span>
              <Badge variant={documentSummary.category === 'CONTRACT' ? 'default' : 'secondary'}>
                {documentSummary.category === 'CONTRACT' ? 'Available' : 'Limited'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Risk Assessment</span>
              <Badge variant={documentSummary.category === 'CONTRACT' ? 'default' : 'secondary'}>
                {documentSummary.category === 'CONTRACT' ? 'Available' : 'N/A'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Document uploaded and ready for analysis. Use the tabs above to explore AI-powered features.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractSummaryTab;

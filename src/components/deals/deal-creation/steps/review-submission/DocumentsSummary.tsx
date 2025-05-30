
import React from 'react';
import { FileText, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DealCreationData } from '../../types';

interface DocumentsSummaryProps {
  data: DealCreationData;
  onDownloadPDF: () => void;
}

export const DocumentsSummary: React.FC<DocumentsSummaryProps> = ({ data, onDownloadPDF }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            Documents ({data.uploadedDocuments.length})
          </CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={onDownloadPDF}>
          <Download className="mr-2 h-4 w-4" />
          Download Summary
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.uploadedDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{doc.filename}</span>
              </div>
              <Badge variant="outline">{doc.type}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

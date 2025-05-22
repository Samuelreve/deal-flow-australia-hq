
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DocumentTabProps {
  contractText: string;
}

const DocumentTab: React.FC<DocumentTabProps> = ({ contractText }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Full Document</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted p-4 rounded-md overflow-auto max-h-[600px]">
          <pre className="text-sm whitespace-pre-wrap font-mono text-muted-foreground">
            {contractText}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentTab;

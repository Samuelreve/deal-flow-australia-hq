
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentTabProps {
  contractText: string;
}

const DocumentTab: React.FC<DocumentTabProps> = ({ contractText }) => {
  const [expanded, setExpanded] = useState(false);
  const maxHeight = expanded ? '100%' : '600px';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Full Document</CardTitle>
      </CardHeader>
      <CardContent>
        {contractText ? (
          <>
            <div className="bg-muted p-4 rounded-md overflow-auto transition-all" style={{ maxHeight }}>
              <pre className="text-sm whitespace-pre-wrap font-mono text-muted-foreground">
                {contractText}
              </pre>
            </div>
            
            {contractText.length > 500 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-4 w-full flex items-center justify-center"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" /> Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" /> Show More
                  </>
                )}
              </Button>
            )}
          </>
        ) : (
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm">
              No document content available. Please upload a document to view its contents.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentTab;

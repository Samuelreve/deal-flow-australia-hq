
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertCircle, FileText, Loader } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentTabProps {
  contractText: string;
}

const DocumentTab: React.FC<DocumentTabProps> = ({ contractText }) => {
  const [expanded, setExpanded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const maxHeight = expanded ? '100%' : '600px';
  
  // Process large text content with a slight delay to improve UI responsiveness
  useEffect(() => {
    if (contractText && contractText.length > 10000) {
      setProcessing(true);
      const timer = setTimeout(() => {
        setProcessing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [contractText]);
  
  const hasContent = contractText && contractText.trim().length > 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Full Document
        </CardTitle>
      </CardHeader>
      <CardContent>
        {processing ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader className="h-6 w-6 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Processing document content...</p>
          </div>
        ) : hasContent ? (
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

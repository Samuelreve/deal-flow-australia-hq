
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, FileText } from 'lucide-react';

interface DocumentStatusAlertProps {
  documentSummary?: any;
  contractText: string;
}

const DocumentStatusAlert: React.FC<DocumentStatusAlertProps> = ({
  documentSummary,
  contractText
}) => {
  if (!contractText) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <FileText className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>No Document Uploaded:</strong> Please upload a contract document to begin analysis.
        </AlertDescription>
      </Alert>
    );
  }

  if (!documentSummary) {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Analyzing Document:</strong> Please wait while we analyze your uploaded document.
        </AlertDescription>
      </Alert>
    );
  }

  if (documentSummary.category === 'CONTRACT') {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Contract Ready:</strong> Your contract document has been analyzed and is ready for AI assistance.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <strong>Limited Functionality:</strong> This document may not be a standard contract. Some features may be limited.
      </AlertDescription>
    </Alert>
  );
};

export default DocumentStatusAlert;

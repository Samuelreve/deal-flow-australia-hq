
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface DocumentStatusAlertProps {
  documentSummary?: any;
  contractText?: string;
}

const DocumentStatusAlert: React.FC<DocumentStatusAlertProps> = ({
  documentSummary,
  contractText
}) => {
  if (!documentSummary) {
    return (
      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          No document uploaded yet. Please upload a contract to start asking questions.
        </AlertDescription>
      </Alert>
    );
  }

  if (documentSummary.category === 'CONTRACT') {
    return (
      <Alert className="mb-6 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          ✅ Legal contract uploaded successfully! You can now ask questions about this document.
        </AlertDescription>
      </Alert>
    );
  }

  if (documentSummary.category === 'FINANCIAL') {
    return (
      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          ⚠️ Financial document detected. Please upload a legal contract for detailed analysis.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-6 border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        ❌ Please upload a legal contract for analysis.
      </AlertDescription>
    </Alert>
  );
};

export default DocumentStatusAlert;

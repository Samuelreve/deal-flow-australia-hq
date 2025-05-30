
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, FileText, Info } from 'lucide-react';

interface DocumentStatusAlertProps {
  documentSummary?: any;
  contractText: string;
}

const DocumentStatusAlert: React.FC<DocumentStatusAlertProps> = ({
  documentSummary,
  contractText
}) => {
  if (!contractText || contractText.length < 50) {
    return (
      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Document Upload Required</strong>
          <br />
          Please upload a contract document to begin analysis. Supported formats: PDF, Word, RTF, and Text files.
        </AlertDescription>
      </Alert>
    );
  }

  if (documentSummary) {
    const isContract = documentSummary.category === 'CONTRACT';
    
    return (
      <Alert className={`mb-6 ${isContract ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
        {isContract ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <Info className="h-4 w-4 text-blue-600" />
        )}
        <AlertDescription className={isContract ? 'text-green-800' : 'text-blue-800'}>
          <strong>{documentSummary.title || 'Document Analyzed'}</strong>
          <br />
          {documentSummary.message || 'Document has been processed and is ready for analysis.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-6 border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <strong>Document Ready for Analysis</strong>
        <br />
        Your document has been uploaded and processed. You can now ask questions or request analysis.
      </AlertDescription>
    </Alert>
  );
};

export default DocumentStatusAlert;

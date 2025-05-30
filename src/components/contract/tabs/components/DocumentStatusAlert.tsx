
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, FileText, Loader, XCircle } from 'lucide-react';

interface DocumentStatusAlertProps {
  documentSummary?: any;
  contractText: string;
  extractionStatus?: 'pending' | 'processing' | 'completed' | 'error';
  analysisStatus?: 'pending' | 'processing' | 'completed' | 'error';
}

const DocumentStatusAlert: React.FC<DocumentStatusAlertProps> = ({
  documentSummary,
  contractText,
  extractionStatus = 'pending',
  analysisStatus = 'pending'
}) => {
  if (!contractText) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <FileText className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>No Document Uploaded:</strong> Please upload a contract document (PDF, Word, RTF, or text file) to begin analysis.
        </AlertDescription>
      </Alert>
    );
  }

  if (extractionStatus === 'processing') {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <Loader className="h-4 w-4 text-yellow-600 animate-spin" />
        <AlertDescription className="text-yellow-800">
          <strong>Processing Document:</strong> Extracting text from your uploaded document. This may take a moment for PDF and Word files.
        </AlertDescription>
      </Alert>
    );
  }

  if (extractionStatus === 'error') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Extraction Error:</strong> Failed to extract text from the document. Some features may be limited. Try uploading a text file for full functionality.
        </AlertDescription>
      </Alert>
    );
  }

  if (!documentSummary && analysisStatus === 'processing') {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <Loader className="h-4 w-4 text-amber-600 animate-spin" />
        <AlertDescription className="text-amber-800">
          <strong>Analyzing Document:</strong> AI is analyzing your contract content. Please wait while we process the document.
        </AlertDescription>
      </Alert>
    );
  }

  if (extractionStatus === 'completed' && (documentSummary?.category === 'CONTRACT' || analysisStatus === 'completed')) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Contract Ready:</strong> Your contract document has been successfully processed and is ready for AI assistance and analysis.
        </AlertDescription>
      </Alert>
    );
  }

  if (extractionStatus === 'completed') {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Document Processed:</strong> Text extracted successfully. This document may not be a standard contract, so some AI features may be limited.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <strong>Processing:</strong> Document is being processed. Please wait for analysis to complete.
      </AlertDescription>
    </Alert>
  );
};

export default DocumentStatusAlert;

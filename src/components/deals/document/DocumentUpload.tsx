
import React from 'react';
import { Document } from "@/types/deal";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DocumentUploadForm from "./DocumentUploadForm";

interface DocumentUploadProps {
  dealId: string;
  onUpload?: () => void;
  userRole?: string;
  isParticipant?: boolean;
  documents?: Document[];
  permissions?: {
    canUpload: boolean;
    canAddVersions: boolean;
    userRole: string | null;
  };
  dealStatus?: string | null;
  milestoneId?: string; // Optional milestone ID to associate document with
  milestoneTitle?: string; // Optional milestone title for UI context
}

const DocumentUpload = ({ 
  dealId,
  onUpload,
  userRole = 'user',
  isParticipant = true,
  documents = [],
  permissions,
  dealStatus,
  milestoneId,
  milestoneTitle
}: DocumentUploadProps) => {
  // Check if user has permission to upload documents
  const canUploadDocuments = permissions?.canUpload ?? 
    (isParticipant && ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase()));
  
  // Check if deal status allows uploads
  const isDealStatusAllowingUploads = !dealStatus || ['draft', 'active', 'pending'].includes(dealStatus);

  // Don't render if user can't upload or deal status doesn't allow uploads
  if (!canUploadDocuments || !isDealStatusAllowingUploads) {
    // If it's a status restriction, show an explanation
    if (isParticipant && !isDealStatusAllowingUploads) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Document uploads are not allowed when the deal is in {dealStatus} status.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  }

  const handleDocumentUpload = () => {
    // Call the onUpload callback if provided
    onUpload?.();
  };

  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="text-lg font-semibold mb-3">
        {milestoneTitle ? `Upload Document for: ${milestoneTitle}` : 'Upload Document'}
      </h4>
      
      <div className="mb-4">
        <DocumentUploadForm 
          dealId={dealId}
          onUpload={handleDocumentUpload}
          documents={documents}
          milestoneId={milestoneId}
        />
      </div>
    </div>
  );
};

export default DocumentUpload;

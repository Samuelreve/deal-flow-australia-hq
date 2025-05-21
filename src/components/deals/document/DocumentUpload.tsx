
import { Document } from "@/types/deal";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DocumentUploadForm from "./DocumentUploadForm";
import SmartTemplateButton from "./SmartTemplateButton";

interface DocumentUploadProps {
  onUpload: (file: File, category: string, documentId?: string) => Promise<Document | null>;
  uploading: boolean;
  userRole?: string;
  isParticipant?: boolean;
  documents?: Document[];
  permissions?: {
    canUpload: boolean;
    canAddVersions: boolean;
    userRole: string | null;
  };
  dealStatus?: string | null;
  dealId: string;
}

const DocumentUpload = ({ 
  onUpload, 
  uploading, 
  userRole = 'user',
  isParticipant = true,
  documents = [],
  permissions,
  dealStatus,
  dealId
}: DocumentUploadProps) => {
  // Check if user has permission to upload documents based on passed permissions or fallback to role check
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

  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="text-lg font-semibold mb-3">Upload Document</h4>
      
      <div className="flex items-center gap-3 mb-4">
        <DocumentUploadForm 
          onUpload={onUpload}
          uploading={uploading}
          documents={documents}
        />
        
        {/* Add the Smart Template Button */}
        <SmartTemplateButton 
          dealId={dealId}
          onDocumentSaved={() => {
            // This function will be called after a document is saved
            // Could be used to refresh the document list
          }}
          userRole={userRole}
        />
      </div>
    </div>
  );
};

export default DocumentUpload;

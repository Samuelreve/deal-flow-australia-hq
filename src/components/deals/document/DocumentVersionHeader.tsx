
import React from 'react';
import { Document, DocumentVersion } from "@/types/deal";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, ChevronLeft } from "lucide-react";
import DocumentSummaryButton from "./DocumentSummaryButton";

interface DocumentVersionHeaderProps {
  document?: Document; // Make document optional
  version?: DocumentVersion;
  onDelete?: (version: DocumentVersion) => void;
  canDelete?: boolean;
  dealId?: string;
  userRole?: string;
  onBack?: () => void;
}

const DocumentVersionHeader: React.FC<DocumentVersionHeaderProps> = ({
  document,
  version,
  onDelete,
  canDelete = false,
  dealId,
  userRole = 'user',
  onBack
}) => {
  // If we have onBack but no version, this is the document header in the versions list view
  if (onBack && document && !version) {
    return (
      <div className="flex justify-between items-center border-b pb-3 mb-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-1.5">
            <FileText className="h-5 w-5 text-blue-500" />
            {document.name}
          </h3>
        </div>
        
        <Button variant="ghost" size="sm" className="gap-1" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
          Back to Documents
        </Button>
      </div>
    );
  }

  // If no document or version provided, return empty header
  if (!document || !version || !dealId) {
    return null;
  }

  const handleDownload = () => {
    // Open the URL in a new tab/window
    window.open(version.url, '_blank');
  };

  return (
    <div className="flex justify-between items-center border-b pb-3 mb-3">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-1.5">
          <FileText className="h-5 w-5 text-blue-500" />
          {document.name} - Version {version.versionNumber}
        </h3>
        <p className="text-sm text-muted-foreground">
          Uploaded {new Date(version.uploadedAt).toLocaleDateString()}, {Math.round(version.size / 1024)} KB
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Add the summary button */}
        <DocumentSummaryButton 
          dealId={dealId} 
          documentId={document.id} 
          documentVersionId={version.id}
          userRole={userRole}
        />
        
        <Button variant="outline" size="sm" className="gap-1" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          Download
        </Button>
        
        {canDelete && onDelete && (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1 text-red-600 hover:text-red-700" 
            onClick={() => onDelete(version)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

export default DocumentVersionHeader;

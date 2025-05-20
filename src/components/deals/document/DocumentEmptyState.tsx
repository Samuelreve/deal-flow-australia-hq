
import React from 'react';
import { FolderPlus } from 'lucide-react';

interface DocumentEmptyStateProps {
  isParticipant?: boolean;
}

const DocumentEmptyState: React.FC<DocumentEmptyStateProps> = ({ isParticipant = false }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-md bg-muted/40">
      <FolderPlus className="w-12 h-12 text-muted-foreground mb-2" />
      <h3 className="text-lg font-medium">No documents yet</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        {isParticipant ? 
          "Upload documents to share with other participants in this deal." : 
          "No documents have been uploaded to this deal yet."}
      </p>
      {isParticipant && (
        <p className="text-xs text-muted-foreground">
          Supported formats: PDF, DOCX, XLSX, PPTX, JPG, PNG
        </p>
      )}
    </div>
  );
};

export default DocumentEmptyState;


import { Document, DocumentVersion } from "@/types/documentVersion";
import DeleteDocumentDialog from "./DeleteDocumentDialog";
import DeleteVersionDialog from "./DeleteVersionDialog";
import ShareDocumentDialog from "./ShareDocumentDialog";

interface DocumentDialogsProps {
  // Document delete dialog props
  documentToDelete: Document | null;
  showDeleteDialog: boolean;
  isDeleting: boolean;
  onCloseDeleteDialog: () => void;
  onConfirmDelete: () => Promise<void>;
  
  // Version delete dialog props
  versionToDelete: DocumentVersion | null;
  showVersionDeleteDialog: boolean;
  isDeletingVersion: boolean;
  onCloseVersionDeleteDialog: () => void;
  onConfirmVersionDelete: () => Promise<void>;
  
  // Share dialog props
  showShareDialog: boolean;
  onCloseShareDialog: () => void;
  versionToShare: DocumentVersion | null;
  documentName?: string;
}

const DocumentDialogs = ({
  documentToDelete,
  showDeleteDialog,
  isDeleting,
  onCloseDeleteDialog,
  onConfirmDelete,
  versionToDelete,
  showVersionDeleteDialog,
  isDeletingVersion,
  onCloseVersionDeleteDialog,
  onConfirmVersionDelete,
  showShareDialog,
  onCloseShareDialog,
  versionToShare,
  documentName
}: DocumentDialogsProps) => {
  return (
    <>
      {/* Dialog Components */}
      <DeleteDocumentDialog
        document={documentToDelete}
        isOpen={showDeleteDialog}
        isDeleting={isDeleting}
        onClose={onCloseDeleteDialog}
        onConfirm={onConfirmDelete}
      />

      <DeleteVersionDialog
        version={versionToDelete}
        isOpen={showVersionDeleteDialog}
        isDeleting={isDeletingVersion}
        onClose={onCloseVersionDeleteDialog}
        onConfirm={onConfirmVersionDelete}
      />
      
      <ShareDocumentDialog
        isOpen={showShareDialog}
        onClose={onCloseShareDialog}
        documentVersion={versionToShare || undefined}
        documentName={documentName}
      />
    </>
  );
};

export default DocumentDialogs;

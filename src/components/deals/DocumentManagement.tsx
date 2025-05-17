
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Document } from "@/types/deal";
import DocumentList from "./document/DocumentList";
import DocumentUpload from "./document/DocumentUpload";
import DeleteDocumentDialog from "./document/DeleteDocumentDialog";
import { useDocuments } from "@/hooks/useDocuments";

// Define props for the DocumentManagement component
interface DocumentManagementProps {
  dealId: string;
  userRole?: string;
  initialDocuments?: Document[];
}

const DocumentManagement = ({ 
  dealId, 
  userRole = "admin", 
  initialDocuments = [] 
}: DocumentManagementProps) => {
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { 
    documents, 
    isLoading, 
    uploading, 
    uploadDocument, 
    deleteDocument 
  } = useDocuments(dealId, initialDocuments);

  // Handle document deletion
  const openDeleteDialog = (document: Document) => {
    setDocumentToDelete(document);
    setShowDeleteDialog(true);
  };
  
  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDocumentToDelete(null);
  };
  
  const confirmDelete = async () => {
    if (!documentToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteDocument(documentToDelete);
      closeDeleteDialog();
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle document upload with category
  const handleUpload = async (file: File, category: string) => {
    await uploadDocument(file, category);
  };

  return (
    <div className="space-y-4">
      {/* Document List */}
      <DocumentList 
        documents={documents}
        isLoading={isLoading}
        onDeleteDocument={openDeleteDialog}
        userRole={userRole}
        userId={user?.id}
      />

      {/* Document Upload Section */}
      <DocumentUpload 
        onUpload={handleUpload}
        uploading={uploading}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteDocumentDialog
        document={documentToDelete}
        isOpen={showDeleteDialog}
        isDeleting={isDeleting}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default DocumentManagement;

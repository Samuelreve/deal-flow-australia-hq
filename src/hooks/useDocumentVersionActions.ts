
import { useState } from 'react';
import { DocumentVersion } from "@/types/deal";
import { toast } from "sonner";

export interface DocumentVersionActionsProps {
  userRole: string;
  userId?: string;
  documentOwnerId: string;
}

export const useDocumentVersionActions = ({
  userRole,
  userId,
  documentOwnerId
}: DocumentVersionActionsProps) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  
  const canDelete = (version?: DocumentVersion): boolean => {
    if (!version || !userId) return false;
    
    return userRole === "admin" || 
           (userRole === "seller" && userId === documentOwnerId) ||
           (version.uploadedBy === userId);
  };
  
  const handleSelectVersion = (version: DocumentVersion) => {
    setSelectedVersionId(version.id);
  };
  
  const handleShareVersion = (version: DocumentVersion, onShare: (version: DocumentVersion) => void) => {
    try {
      onShare(version);
    } catch (error) {
      toast.error("Failed to share document");
      console.error("Error sharing document:", error);
    }
  };
  
  return {
    selectedVersionId,
    setSelectedVersionId,
    canDelete,
    handleSelectVersion,
    handleShareVersion
  };
};


import { useState } from 'react';
import { DocumentVersion } from "@/types/deal";

export const useDocumentVersionPermissions = ({
  userRole,
  userId,
  documentOwnerId
}: {
  userRole: string;
  userId?: string;
  documentOwnerId: string;
}) => {
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

  return {
    selectedVersionId,
    setSelectedVersionId,
    canDelete,
    handleSelectVersion
  };
};

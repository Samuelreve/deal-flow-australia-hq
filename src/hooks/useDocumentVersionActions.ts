
import { useState } from 'react';
import { DocumentVersion } from "@/types/deal";
import { useDocumentVersionPermissions, useDocumentSharing } from './document-sharing';

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
  const permissions = useDocumentVersionPermissions({
    userRole,
    userId,
    documentOwnerId
  });

  const sharing = useDocumentSharing({
    userRole,
    userId,
    documentOwnerId
  });
  
  return {
    // Version selection and permissions
    selectedVersionId: permissions.selectedVersionId,
    setSelectedVersionId: permissions.setSelectedVersionId,
    canDelete: permissions.canDelete,
    handleSelectVersion: permissions.handleSelectVersion,
    
    // Sharing functionality
    handleShareVersion: sharing.handleShareVersion,
    generateShareLink: sharing.generateShareLink,
    isSharing: sharing.isSharing,
    shareLinks: sharing.shareLinks,
    loadingShareLinks: sharing.loadingShareLinks,
    fetchShareLinks: sharing.fetchShareLinks,
    revokeShareLink: sharing.revokeShareLink,
    revokingLink: sharing.revokingLink
  };
};

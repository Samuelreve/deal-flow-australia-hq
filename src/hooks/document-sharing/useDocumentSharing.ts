
import { useState } from 'react';
import { DocumentVersion } from "@/types/deal";
import { toast } from "sonner";
import { useShareLinksManagement } from './useShareLinksManagement';
import { DocumentSharingHookOptions } from './types';

export const useDocumentSharing = (options: DocumentSharingHookOptions) => {
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const { userId } = options;
  
  const {
    shareLinks,
    loadingShareLinks,
    fetchShareLinks,
    generateShareLink,
    revokeShareLink,
    revokingLink
  } = useShareLinksManagement(options);
  
  const handleShareVersion = async (version: DocumentVersion, onShare: (version: DocumentVersion) => void) => {
    if (!userId) {
      toast.error("You must be logged in to share documents");
      return;
    }
    
    try {
      setIsSharing(true);
      
      // First call the onShare callback which will open the share dialog
      onShare(version);
      
      // Load any existing share links for this version
      await fetchShareLinks(version.id);
    } catch (error) {
      toast.error("Failed to prepare document sharing");
      console.error("Error preparing document share:", error);
    } finally {
      setIsSharing(false);
    }
  };

  return {
    isSharing,
    shareLinks,
    loadingShareLinks,
    fetchShareLinks,
    generateShareLink,
    revokeShareLink,
    revokingLink,
    handleShareVersion
  };
};


import { useState } from 'react';
import { DocumentVersion } from "@/types/deal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [isSharing, setIsSharing] = useState<boolean>(false);
  
  const canDelete = (version?: DocumentVersion): boolean => {
    if (!version || !userId) return false;
    
    return userRole === "admin" || 
           (userRole === "seller" && userId === documentOwnerId) ||
           (version.uploadedBy === userId);
  };
  
  const handleSelectVersion = (version: DocumentVersion) => {
    setSelectedVersionId(version.id);
  };
  
  const handleShareVersion = async (version: DocumentVersion, onShare: (version: DocumentVersion) => void) => {
    if (!userId) {
      toast.error("You must be logged in to share documents");
      return;
    }
    
    try {
      setIsSharing(true);
      
      // First call the onShare callback which will open the share dialog
      onShare(version);
    } catch (error) {
      toast.error("Failed to prepare document sharing");
      console.error("Error preparing document share:", error);
    } finally {
      setIsSharing(false);
    }
  };
  
  // Function to generate a secure share link using the Edge Function
  const generateShareLink = async (
    documentVersionId: string, 
    options: { 
      expiresAt?: Date | null, 
      canDownload: boolean 
    }
  ) => {
    const { session } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      toast.error("You must be logged in to share documents");
      throw new Error("Authentication required");
    }
    
    const { data, error } = await supabase.functions.invoke('create-share-link', {
      body: {
        document_version_id: documentVersionId,
        expires_at: options.expiresAt?.toISOString() || null,
        can_download: options.canDownload
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    
    if (error) {
      console.error("Error generating share link:", error);
      throw new Error(error.message || "Failed to generate share link");
    }
    
    return data;
  };
  
  return {
    selectedVersionId,
    setSelectedVersionId,
    canDelete,
    handleSelectVersion,
    handleShareVersion,
    generateShareLink,
    isSharing
  };
};

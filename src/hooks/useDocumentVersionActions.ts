
import { useState } from 'react';
import { DocumentVersion } from "@/types/deal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface ShareLinkWithStatus {
  id: string;
  document_version_id: string;
  shared_by_user_id: string;
  expires_at: string | null;
  token: string;
  created_at: string;
  can_download: boolean;
  is_active: boolean;
  status: 'active' | 'expired' | 'revoked';
  share_url: string;
}

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
  const [shareLinks, setShareLinks] = useState<ShareLinkWithStatus[]>([]);
  const [loadingShareLinks, setLoadingShareLinks] = useState<boolean>(false);
  const [revokingLink, setRevokingLink] = useState<string | null>(null);
  
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
      
      // Load any existing share links for this version
      await fetchShareLinks(version.id);
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
    const { data: { session } } = await supabase.auth.getSession();
    
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
    
    // After successful link creation, refresh the share links
    await fetchShareLinks(documentVersionId);
    
    return data;
  };
  
  // Function to fetch share links for a document version
  const fetchShareLinks = async (versionId: string) => {
    if (!versionId || !userId) return;
    
    try {
      setLoadingShareLinks(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Authentication required");
      }
      
      // Fix: pass versionId in the body instead of using query parameter
      const { data, error } = await supabase.functions.invoke('manage-share-links', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: {
          versionId
        }
      });
      
      if (error) {
        console.error("Error fetching share links:", error);
        throw new Error(error.message || "Failed to fetch share links");
      }
      
      setShareLinks(data?.links || []);
    } catch (error) {
      console.error("Error fetching share links:", error);
      toast.error("Failed to load share links");
    } finally {
      setLoadingShareLinks(false);
    }
  };
  
  // Function to revoke a share link
  const revokeShareLink = async (linkId: string) => {
    if (!userId) {
      toast.error("You must be logged in to revoke share links");
      return;
    }
    
    try {
      setRevokingLink(linkId);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Authentication required");
      }
      
      const { data, error } = await supabase.functions.invoke('manage-share-links', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: {
          linkId
        }
      });
      
      if (error) {
        console.error("Error revoking share link:", error);
        throw new Error(error.message || "Failed to revoke share link");
      }
      
      // Update the share links list
      setShareLinks(prevLinks => 
        prevLinks.map(link => 
          link.id === linkId 
            ? { ...link, is_active: false, status: 'revoked' as const } 
            : link
        )
      );
      
      toast.success("Share link revoked successfully");
    } catch (error) {
      console.error("Error revoking share link:", error);
      toast.error("Failed to revoke share link");
    } finally {
      setRevokingLink(null);
    }
  };
  
  return {
    selectedVersionId,
    setSelectedVersionId,
    canDelete,
    handleSelectVersion,
    handleShareVersion,
    generateShareLink,
    isSharing,
    shareLinks,
    loadingShareLinks,
    fetchShareLinks,
    revokeShareLink,
    revokingLink
  };
};

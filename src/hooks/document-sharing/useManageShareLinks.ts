
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShareLinkWithStatus } from './types';

interface UseManageShareLinksOptions {
  userId?: string;
}

export const useManageShareLinks = ({ userId }: UseManageShareLinksOptions = {}) => {
  const [shareLinks, setShareLinks] = useState<ShareLinkWithStatus[]>([]);
  const [loadingShareLinks, setLoadingShareLinks] = useState<boolean>(false);
  const [revokingLink, setRevokingLink] = useState<string | null>(null);

  // Function to fetch share links for a document version
  const fetchShareLinks = useCallback(async (versionId: string) => {
    if (!versionId || !userId) return;
    
    try {
      setLoadingShareLinks(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Authentication required");
      }
      
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
    } catch (error: any) {
      console.error("Error fetching share links:", error);
      toast.error("Failed to load share links");
    } finally {
      setLoadingShareLinks(false);
    }
  }, [userId]);
  
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
            ? { ...link, is_active: false, status: 'revoked' } 
            : link
        )
      );
      
      toast.success("Share link revoked successfully");
    } catch (error: any) {
      console.error("Error revoking share link:", error);
      toast.error(error.message || "Failed to revoke share link");
    } finally {
      setRevokingLink(null);
    }
  };

  return {
    shareLinks,
    loadingShareLinks,
    fetchShareLinks,
    revokeShareLink,
    revokingLink
  };
};

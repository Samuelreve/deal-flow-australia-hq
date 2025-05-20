
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShareLinkWithStatus, ShareLinkOptions, DocumentSharingHookOptions } from './types';

export const useShareLinksManagement = ({
  userRole,
  userId,
}: DocumentSharingHookOptions) => {
  const [shareLinks, setShareLinks] = useState<ShareLinkWithStatus[]>([]);
  const [loadingShareLinks, setLoadingShareLinks] = useState<boolean>(false);
  const [revokingLink, setRevokingLink] = useState<string | null>(null);

  // Function to generate a secure share link using the Edge Function
  const generateShareLink = async (
    documentVersionId: string, 
    options: ShareLinkOptions
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
        can_download: options.canDownload,
        recipients: options.recipients || [],
        custom_message: options.customMessage || ""
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    
    if (error) {
      console.error("Error generating share link:", error);
      throw new Error(error.message || "Failed to generate share link");
    }
    
    // Show notifications about email sending results if applicable
    if (data?.email_results && options.recipients && options.recipients.length > 0) {
      if (data.email_results.all_successful) {
        toast.success(`Document share link ${options.recipients.length > 1 ? 'emails' : 'email'} sent successfully`);
      } else {
        // Some emails failed
        const failedEmails = data.email_results.details
          .filter((result: any) => !result.success)
          .map((result: any) => result.recipient);
        
        if (failedEmails.length > 0) {
          toast.error(`Failed to send ${failedEmails.length} email${failedEmails.length > 1 ? 's' : ''}. The link was created but not all recipients were notified.`);
        }
      }
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
    shareLinks,
    loadingShareLinks,
    fetchShareLinks,
    generateShareLink,
    revokeShareLink,
    revokingLink
  };
};

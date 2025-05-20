
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShareLinkOptions } from './types';

interface UseShareLinkOptions {
  userId?: string;
  onSuccess?: (url: string, emailsSent: boolean, recipientCount: number) => void;
}

export const useShareLink = ({ userId, onSuccess }: UseShareLinkOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [emailsSent, setEmailsSent] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);

  const generateShareLink = async (
    documentVersionId: string, 
    options: ShareLinkOptions
  ) => {
    if (!userId) {
      setError('You must be logged in to share documents');
      return null;
    }

    setLoading(true);
    setError(null);
    setShareUrl(null);
    setEmailsSent(false);
    setRecipientCount(0);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }
      
      const { data: response, error: functionError } = await supabase.functions.invoke('create-share-link', {
        body: {
          document_version_id: documentVersionId,
          expires_at: options.expiresAt ? options.expiresAt.toISOString() : null,
          can_download: options.canDownload,
          recipients: options.recipients || [],
          custom_message: options.customMessage || ""
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (functionError) {
        throw new Error(functionError.message || 'Failed to generate share link');
      }
      
      if (!response?.success || !response?.data?.share_url) {
        throw new Error('Invalid response from server');
      }
      
      const url = response.data.share_url;
      setShareUrl(url);
      
      // Track if emails were sent
      if (options.recipients && options.recipients.length > 0 && response.email_results) {
        const allSent = response.email_results.all_successful;
        setEmailsSent(allSent);
        setRecipientCount(options.recipients.length);
        
        if (allSent) {
          toast.success(`Share link sent to ${options.recipients.length} recipient${options.recipients.length !== 1 ? 's' : ''}`);
        } else {
          toast.error('Not all emails could be sent, but the share link was created');
        }
      } else {
        toast.success('Share link created successfully');
      }
      
      if (onSuccess) {
        onSuccess(url, options.recipients ? response.email_results?.all_successful || false : false, options.recipients?.length || 0);
      }
      
      return url;
    } catch (err: any) {
      console.error('Error generating share link:', err);
      setError(err.message || 'Failed to generate share link');
      toast.error(err.message || 'Failed to generate share link');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const resetState = () => {
    setShareUrl(null);
    setError(null);
    setEmailsSent(false);
    setRecipientCount(0);
  };

  return {
    generateShareLink,
    resetState,
    loading,
    error,
    shareUrl,
    emailsSent,
    recipientCount
  };
};

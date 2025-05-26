
import { useState, useEffect } from 'react';
import { DocumentVersion } from '@/types/deal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDocumentVersionActions } from '@/hooks/useDocumentVersionActions';

export const useShareDialogState = (
  isOpen: boolean, 
  onClose: () => void,
  documentVersion?: DocumentVersion
) => {
  const { user } = useAuth();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('create');
  
  // Form state
  const [allowDownload, setAllowDownload] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [emailsSent, setEmailsSent] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);
  
  const { 
    shareLinks, 
    loadingShareLinks, 
    fetchShareLinks, 
    revokeShareLink, 
    revokingLink 
  } = useDocumentVersionActions({
    userRole: user?.profile?.role || "seller",
    userId: user?.id,
    documentOwnerId: documentVersion?.uploadedBy || ""
  });

  // Fetch share links when dialog opens
  useEffect(() => {
    if (isOpen && documentVersion?.id) {
      fetchShareLinks(documentVersion.id);
    }
  }, [isOpen, documentVersion?.id, fetchShareLinks]);

  const handleGenerateLink = async () => {
    if (!documentVersion || !user?.id) {
      setError('Missing document version or authentication');
      return;
    }

    setLoading(true);
    setError(null);
    setEmailsSent(false);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }
      
      const { data: response, error: functionError } = await supabase.functions.invoke('create-share-link', {
        body: {
          document_version_id: documentVersion.id,
          expires_at: expiryDate ? expiryDate.toISOString() : null,
          can_download: allowDownload,
          recipients: recipients,
          custom_message: customMessage
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
      
      setShareUrl(response.data.share_url);
      
      // Track if emails were sent
      if (recipients.length > 0 && response.email_results) {
        setEmailsSent(response.email_results.all_successful);
        setRecipientCount(recipients.length);
      }
      
      // Refresh the list of share links
      fetchShareLinks(documentVersion.id);
    } catch (err: any) {
      console.error('Error generating share link:', err);
      setError(err.message || 'Failed to generate share link');
      toast.error('Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLink = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const handleClose = () => {
    setShareUrl(null);
    setError(null);
    setAllowDownload(false);
    setExpiryDate(null);
    setRecipients([]);
    setCustomMessage('');
    setActiveTab('create');
    setEmailsSent(false);
    setRecipientCount(0);
    onClose();
  };
  
  const handleRevokeLink = async (linkId: string) => {
    await revokeShareLink(linkId);
  };

  return {
    activeTab,
    setActiveTab,
    shareUrl,
    loading,
    error,
    allowDownload,
    setAllowDownload,
    expiryDate,
    setExpiryDate,
    recipients,
    setRecipients,
    customMessage, 
    setCustomMessage,
    shareLinks,
    loadingShareLinks,
    handleGenerateLink,
    handleOpenLink,
    handleClose,
    handleRevokeLink,
    revokingLink,
    emailsSent,
    recipientCount
  };
};

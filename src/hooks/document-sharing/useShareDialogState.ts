
import { useState, useEffect } from 'react';
import { DocumentVersion } from '@/types/deal';
import { useAuth } from '@/contexts/AuthContext';
import { useShareLink } from './useShareLink';
import { useManageShareLinks } from './useManageShareLinks';

export const useShareDialogState = (
  isOpen: boolean, 
  onClose: () => void,
  documentVersion?: DocumentVersion
) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  
  // Form state
  const [allowDownload, setAllowDownload] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  
  // Share link functionality
  const { 
    generateShareLink, 
    resetState, 
    loading, 
    error, 
    shareUrl,
    emailsSent,
    recipientCount
  } = useShareLink({ 
    userId: user?.id 
  });
  
  // Share links management
  const { 
    shareLinks, 
    loadingShareLinks, 
    fetchShareLinks, 
    revokeShareLink, 
    revokingLink 
  } = useManageShareLinks({
    userId: user?.id
  });

  // Fetch share links when dialog opens
  useEffect(() => {
    if (isOpen && documentVersion?.id) {
      fetchShareLinks(documentVersion.id);
    }
  }, [isOpen, documentVersion?.id, fetchShareLinks]);

  const handleGenerateLink = async () => {
    if (!documentVersion || !user?.id) {
      return;
    }

    await generateShareLink(documentVersion.id, {
      expiresAt: expiryDate,
      canDownload: allowDownload,
      recipients,
      customMessage
    });
    
    // Refresh the list of share links after generating a new one
    if (documentVersion.id) {
      fetchShareLinks(documentVersion.id);
    }
  };

  const handleOpenLink = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const handleClose = () => {
    resetState();
    setAllowDownload(false);
    setExpiryDate(null);
    setRecipients([]);
    setCustomMessage('');
    setActiveTab('create');
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

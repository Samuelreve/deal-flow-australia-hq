
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DocumentVersion } from '@/types/deal';
import ShareDialogHeader from './share/ShareDialogHeader';
import ShareDialogTabs from './share/ShareDialogTabs';
import ShareDialogFooter from './share/ShareDialogFooter';
import { useShareDialogState } from './share/useShareDialogState';

interface ShareDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentVersion?: DocumentVersion;
  documentName?: string;
}

const ShareDocumentDialog: React.FC<ShareDocumentDialogProps> = ({
  isOpen,
  onClose,
  documentVersion,
  documentName
}) => {
  const {
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
    revokingLink
  } = useShareDialogState(isOpen, onClose, documentVersion);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <ShareDialogHeader 
          documentName={documentName}
          documentVersion={documentVersion}
        />

        <div className="space-y-4">
          <ShareDialogTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            shareUrl={shareUrl}
            loading={loading}
            error={error}
            allowDownload={allowDownload}
            setAllowDownload={setAllowDownload}
            expiryDate={expiryDate}
            setExpiryDate={setExpiryDate}
            recipients={recipients}
            setRecipients={setRecipients}
            customMessage={customMessage}
            setCustomMessage={setCustomMessage}
            handleGenerateLink={handleGenerateLink}
            handleOpenLink={handleOpenLink}
            shareLinks={shareLinks}
            loadingShareLinks={loadingShareLinks}
            handleRevokeLink={handleRevokeLink}
            revokingLink={revokingLink}
          />
        </div>

        <ShareDialogFooter
          activeTab={activeTab}
          shareUrl={shareUrl}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ShareDocumentDialog;


import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ShareDocumentForm from './ShareDocumentForm';
import ShareDocumentLink from './ShareDocumentLink';
import ShareLinksList from './ShareLinksList';
import { ShareLinkWithStatus } from '@/hooks/document-sharing/types';

interface ShareDialogTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  shareUrl: string | null;
  loading: boolean;
  error: string | null;
  allowDownload: boolean;
  setAllowDownload: (value: boolean) => void;
  expiryDate: Date | null;
  setExpiryDate: (date: Date | null) => void;
  recipients: string[];
  setRecipients: (recipients: string[]) => void;
  customMessage: string;
  setCustomMessage: (message: string) => void;
  handleGenerateLink: () => Promise<void>;
  handleOpenLink: () => void;
  shareLinks: ShareLinkWithStatus[];
  loadingShareLinks: boolean;
  handleRevokeLink: (linkId: string) => Promise<void>;
  revokingLink: string | null;
}

const ShareDialogTabs: React.FC<ShareDialogTabsProps> = ({
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
  handleGenerateLink,
  handleOpenLink,
  shareLinks,
  loadingShareLinks,
  handleRevokeLink,
  revokingLink
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="create">Create New Link</TabsTrigger>
        <TabsTrigger value="manage">Manage Links</TabsTrigger>
      </TabsList>
      
      <TabsContent value="create" className="pt-4">
        {!shareUrl ? (
          <ShareDocumentForm
            onGenerateLink={handleGenerateLink}
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
          />
        ) : (
          <ShareDocumentLink
            shareUrl={shareUrl}
            allowDownload={allowDownload}
            expiryDate={expiryDate}
            onOpenLink={handleOpenLink}
          />
        )}
      </TabsContent>
      
      <TabsContent value="manage" className="pt-4">
        <ShareLinksList 
          links={shareLinks}
          loading={loadingShareLinks}
          onRevoke={handleRevokeLink}
          revokingLink={revokingLink}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ShareDialogTabs;

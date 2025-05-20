
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DocumentVersion } from '@/types/deal';
import { useAuth } from '@/contexts/AuthContext';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ShareDocumentForm from './share/ShareDocumentForm';
import ShareDocumentLink from './share/ShareDocumentLink';
import ShareLinksList from './share/ShareLinksList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDocumentVersionActions } from '@/hooks/useDocumentVersionActions';

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
  const { user } = useAuth();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('create');
  
  // Form state
  const [allowDownload, setAllowDownload] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  
  const { 
    shareLinks, 
    loadingShareLinks, 
    fetchShareLinks, 
    revokeShareLink, 
    revokingLink 
  } = useDocumentVersionActions({
    userRole: user?.role || "user",
    userId: user?.id,
    documentOwnerId: documentVersion?.uploadedBy || ""
  });

  // Fetch share links when dialog opens
  useEffect(() => {
    if (isOpen && documentVersion?.id) {
      fetchShareLinks(documentVersion.id);
    }
  }, [isOpen, documentVersion?.id]);

  const handleGenerateLink = async () => {
    if (!documentVersion || !user?.id) {
      setError('Missing document version or authentication');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }
      
      const { data: response, error: functionError } = await supabase.functions.invoke('create-share-link', {
        body: {
          document_version_id: documentVersion.id,
          expires_at: expiryDate ? expiryDate.toISOString() : null,
          can_download: allowDownload
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
    setActiveTab('create');
    onClose();
  };
  
  const handleRevokeLink = async (linkId: string) => {
    await revokeShareLink(linkId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Create a secure link to share this document with external parties
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {documentVersion && (
            <div>
              <p className="font-medium text-sm">Document</p>
              <p className="text-sm text-muted-foreground">{documentName} - Version {documentVersion.versionNumber}</p>
            </div>
          )}

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
        </div>

        <DialogFooter className="sm:justify-start">
          {activeTab === 'create' && shareUrl ? (
            <Button
              variant="outline"
              onClick={handleClose}
              className="mt-2 sm:mt-0"
            >
              Close
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleClose}
              className="mt-2 sm:mt-0"
            >
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDocumentDialog;

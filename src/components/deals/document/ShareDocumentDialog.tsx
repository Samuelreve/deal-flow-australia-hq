
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DocumentVersion } from '@/types/deal';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const { session } = useAuth();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Form state
  const [allowDownload, setAllowDownload] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);

  const handleGenerateLink = async () => {
    if (!documentVersion || !session?.access_token) {
      setError('Missing document version or authentication');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
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
    } catch (err: any) {
      console.error('Error generating share link:', err);
      setError(err.message || 'Failed to generate share link');
      toast.error('Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      
      // Reset the copied state after a few seconds
      setTimeout(() => {
        setCopied(false);
      }, 3000);
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
    setCopied(false);
    onClose();
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

        <div className="space-y-4 py-2 pb-4">
          {documentVersion && (
            <div>
              <p className="font-medium text-sm">Document</p>
              <p className="text-sm text-muted-foreground">{documentName} - Version {documentVersion.versionNumber}</p>
            </div>
          )}

          {!shareUrl ? (
            <>
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowDownload"
                  checked={allowDownload}
                  onCheckedChange={setAllowDownload}
                />
                <Label htmlFor="allowDownload">Allow recipients to download the document</Label>
              </div>

              <div className="space-y-1">
                <Label htmlFor="expiryDate">Link expiration (optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiryDate ? format(expiryDate, "PPP") : "No expiration"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expiryDate || undefined}
                      onSelect={setExpiryDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button 
                onClick={handleGenerateLink} 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Share Link'}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <Label htmlFor="shareLink">Share link</Label>
                <div className="flex space-x-2">
                  <Input
                    id="shareLink"
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={handleCopyToClipboard}
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground mt-2">
                  <p>
                    {allowDownload ? 
                      'Recipients can view and download this document.' : 
                      'Recipients can only view this document.'}
                  </p>
                  {expiryDate && (
                    <p>This link will expire on {format(expiryDate, "PPP")}.</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <Button onClick={handleCopyToClipboard} className="flex-1">
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  Copy Link
                </Button>
                <Button onClick={handleOpenLink} variant="secondary" className="flex-1">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Test Link
                </Button>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          {shareUrl ? (
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

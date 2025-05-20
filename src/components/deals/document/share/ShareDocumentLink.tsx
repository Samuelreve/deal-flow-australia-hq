
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ShareDocumentLinkProps {
  shareUrl: string;
  allowDownload: boolean;
  expiryDate: Date | null;
  onOpenLink: () => void;
}

const ShareDocumentLink: React.FC<ShareDocumentLinkProps> = ({
  shareUrl,
  allowDownload,
  expiryDate,
  onOpenLink,
}) => {
  const [copied, setCopied] = useState(false);

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

  return (
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
        <Button onClick={onOpenLink} variant="secondary" className="flex-1">
          <ExternalLink className="mr-2 h-4 w-4" />
          Test Link
        </Button>
      </div>
    </>
  );
};

export default ShareDocumentLink;


import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Copy, Mail } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface ShareDocumentLinkProps {
  shareUrl: string;
  allowDownload: boolean;
  expiryDate: Date | null;
  onOpenLink: () => void;
  emailsSent?: boolean;
  recipientCount?: number;
}

const ShareDocumentLink: React.FC<ShareDocumentLinkProps> = ({
  shareUrl,
  allowDownload,
  expiryDate,
  onOpenLink,
  emailsSent,
  recipientCount = 0
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-center mb-4 font-medium text-green-600">
          Share link generated successfully!
        </p>
        
        {emailsSent && recipientCount > 0 && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
            <Mail className="mr-2 h-4 w-4" />
            <p className="text-sm">
              Link sent to {recipientCount} {recipientCount === 1 ? 'recipient' : 'recipients'}
            </p>
          </div>
        )}
        
        <div className="flex mb-2">
          <Input
            value={shareUrl}
            readOnly
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            className="ml-2"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div className="text-sm space-y-2 text-muted-foreground">
        <p>
          <span className="font-medium">Download permissions:</span> {allowDownload ? 'Allowed' : 'Not allowed'}
        </p>
        {expiryDate && (
          <p>
            <span className="font-medium">Expires:</span> {format(expiryDate, 'PPP')}
          </p>
        )}
      </div>
      
      <Button 
        variant="default"
        onClick={onOpenLink}
        className="w-full"
      >
        Open Link
      </Button>
    </div>
  );
};

export default ShareDocumentLink;

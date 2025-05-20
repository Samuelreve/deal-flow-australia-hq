
import React from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ShareDialogFooterProps {
  activeTab: string;
  shareUrl: string | null;
  onClose: () => void;
  linkSent?: boolean;
}

const ShareDialogFooter: React.FC<ShareDialogFooterProps> = ({
  activeTab,
  shareUrl,
  onClose,
  linkSent
}) => {
  const buttonLabel = () => {
    if (activeTab === 'create' && shareUrl) {
      return linkSent ? 'Done' : 'Close';
    }
    return 'Cancel';
  };

  return (
    <DialogFooter className="sm:justify-start">
      <Button
        variant="outline"
        onClick={onClose}
        className="mt-2 sm:mt-0"
      >
        {buttonLabel()}
      </Button>
    </DialogFooter>
  );
};

export default ShareDialogFooter;

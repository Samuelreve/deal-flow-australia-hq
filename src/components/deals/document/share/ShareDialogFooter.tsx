
import React from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ShareDialogFooterProps {
  activeTab: string;
  shareUrl: string | null;
  onClose: () => void;
}

const ShareDialogFooter: React.FC<ShareDialogFooterProps> = ({
  activeTab,
  shareUrl,
  onClose
}) => {
  return (
    <DialogFooter className="sm:justify-start">
      {activeTab === 'create' && shareUrl ? (
        <Button
          variant="outline"
          onClick={onClose}
          className="mt-2 sm:mt-0"
        >
          Close
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={onClose}
          className="mt-2 sm:mt-0"
        >
          Cancel
        </Button>
      )}
    </DialogFooter>
  );
};

export default ShareDialogFooter;

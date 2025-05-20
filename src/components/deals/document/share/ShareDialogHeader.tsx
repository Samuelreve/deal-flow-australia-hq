
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DocumentVersion } from '@/types/deal';

interface ShareDialogHeaderProps {
  documentName?: string;
  documentVersion?: DocumentVersion;
}

const ShareDialogHeader: React.FC<ShareDialogHeaderProps> = ({
  documentName,
  documentVersion
}) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Share Document</DialogTitle>
        <DialogDescription>
          Create a secure link to share this document with external parties
        </DialogDescription>
      </DialogHeader>

      {documentVersion && (
        <div>
          <p className="font-medium text-sm">Document</p>
          <p className="text-sm text-muted-foreground">{documentName} - Version {documentVersion.versionNumber}</p>
        </div>
      )}
    </>
  );
};

export default ShareDialogHeader;

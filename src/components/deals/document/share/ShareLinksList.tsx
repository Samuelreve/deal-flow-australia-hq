
import React from 'react';
import { ShareLinkWithStatus } from "@/hooks/document-sharing/types";
import ShareLinkItem from './ShareLinkItem';

interface ShareLinksListProps {
  links: ShareLinkWithStatus[];
  loading: boolean;
  onRevoke: (linkId: string) => void;
  revokingLink: string | null;
}

const ShareLinksList: React.FC<ShareLinksListProps> = ({
  links,
  loading,
  onRevoke,
  revokingLink
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <span className="animate-spin mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </span>
        Loading share links...
      </div>
    );
  }
  
  if (links.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">No share links created yet.</p>;
  }
  
  return (
    <div className="space-y-3 mt-4">
      <h3 className="text-sm font-medium">Existing Share Links</h3>
      {links.map((link) => (
        <ShareLinkItem 
          key={link.id}
          link={link}
          onRevoke={onRevoke}
          revokingLink={revokingLink}
        />
      ))}
    </div>
  );
};

export default ShareLinksList;

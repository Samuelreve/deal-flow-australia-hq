
import React from 'react';
import { ShareLinkWithStatus } from "@/hooks/useDocumentVersionActions";
import { Button } from "@/components/ui/button";
import { Ban, Clock, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format, isValid } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const handleCopyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };
  
  const handleOpenLink = (url: string) => {
    window.open(url, '_blank');
  };
  
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
        <div key={link.id} className="bg-muted/50 rounded-md p-3 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={
                    link.status === 'active' 
                      ? 'default' 
                      : link.status === 'expired' 
                        ? 'outline' 
                        : 'destructive'
                  }
                  className="text-xs"
                >
                  {link.status === 'active' 
                    ? 'Active' 
                    : link.status === 'expired' 
                      ? 'Expired' 
                      : 'Revoked'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Created {format(new Date(link.created_at), "MMM d, yyyy")}
                </span>
              </div>
              
              <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                {link.expires_at && isValid(new Date(link.expires_at)) && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Expires {format(new Date(link.expires_at), "MMM d, yyyy")}
                  </div>
                )}
                <div>
                  {link.can_download ? "Downloadable" : "View only"}
                </div>
              </div>
            </div>
            
            <div className="flex gap-1">
              {link.status === 'active' && (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleCopyToClipboard(link.share_url)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy link</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenLink(link.share_url)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Open link</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onRevoke(link.id)}
                          disabled={revokingLink === link.id}
                          className="text-destructive hover:text-destructive"
                        >
                          {revokingLink === link.id ? (
                            <span className="animate-spin">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                            </span>
                          ) : (
                            <Ban className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Revoke link</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>
          </div>
          
          {link.status === 'active' && (
            <div className="text-xs bg-background/80 rounded p-2 overflow-hidden text-ellipsis">
              {link.share_url}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ShareLinksList;

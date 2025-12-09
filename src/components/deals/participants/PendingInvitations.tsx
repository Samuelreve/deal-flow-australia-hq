
import React, { useState } from "react";
import { DealInvitation } from "@/types/invitation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, RefreshCw, X, Clock, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PendingInvitationsProps {
  invitations: DealInvitation[];
  isLoading: boolean;
  dealId?: string;
  onInvitationUpdated?: () => void;
}

const APP_BASE_URL = "https://deal-flow-australia-hq.lovable.app";

const PendingInvitations: React.FC<PendingInvitationsProps> = ({ 
  invitations, 
  isLoading,
  dealId,
  onInvitationUpdated 
}) => {
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<DealInvitation | null>(null);

  if (isLoading || invitations.length === 0) {
    return null;
  }

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const otherInvitations = invitations.filter(inv => inv.status !== 'pending');

  const handleCopyLink = (invitation: DealInvitation) => {
    if (!invitation.token) {
      toast.error("No invitation link available");
      return;
    }
    
    const inviteUrl = `${APP_BASE_URL}/accept-invite?token=${invitation.token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invitation link copied to clipboard");
  };

  const handleResend = async (invitation: DealInvitation) => {
    if (!dealId) return;
    
    setResendingId(invitation.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to resend invitations");
        return;
      }

      const response = await supabase.functions.invoke('resend-invitation', {
        body: { 
          invitationId: invitation.id,
          dealId 
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to resend invitation");
      }

      toast.success(`Invitation resent to ${invitation.email}`);
      onInvitationUpdated?.();
    } catch (error) {
      console.error("Error resending invitation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to resend invitation");
    } finally {
      setResendingId(null);
    }
  };

  const openRevokeDialog = (invitation: DealInvitation) => {
    setSelectedInvitation(invitation);
    setRevokeDialogOpen(true);
  };

  const handleRevoke = async () => {
    if (!selectedInvitation || !dealId) return;
    
    setRevokingId(selectedInvitation.id);
    setRevokeDialogOpen(false);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to revoke invitations");
        return;
      }

      const response = await supabase.functions.invoke('revoke-invitation', {
        body: { 
          invitationId: selectedInvitation.id,
          dealId 
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to revoke invitation");
      }

      toast.success(`Invitation to ${selectedInvitation.email} has been revoked`);
      onInvitationUpdated?.();
    } catch (error) {
      console.error("Error revoking invitation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to revoke invitation");
    } finally {
      setRevokingId(null);
      setSelectedInvitation(null);
    }
  };

  const isExpired = (tokenExpiresAt: string | null | undefined) => {
    if (!tokenExpiresAt) return false;
    return new Date(tokenExpiresAt) < new Date();
  };

  const getStatusBadge = (invitation: DealInvitation) => {
    if (invitation.status === 'accepted') {
      return (
        <Badge variant="default" className="bg-success/20 text-success border-success/30">
          <Check className="h-3 w-3 mr-1" />
          Accepted
        </Badge>
      );
    }
    if (invitation.status === 'rejected' || invitation.status === 'declined') {
      return (
        <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30">
          <X className="h-3 w-3 mr-1" />
          Declined
        </Badge>
      );
    }
    if (invitation.status === 'revoked') {
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          <AlertCircle className="h-3 w-3 mr-1" />
          Revoked
        </Badge>
      );
    }
    if (isExpired(invitation.token_expires_at)) {
      return (
        <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
          <Clock className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-amber-500/20 text-amber-600 border-amber-500/30">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      seller: "bg-primary/20 text-primary border-primary/30",
      buyer: "bg-blue-500/20 text-blue-600 border-blue-500/30",
      lawyer: "bg-purple-500/20 text-purple-600 border-purple-500/30",
      admin: "bg-red-500/20 text-red-600 border-red-500/30",
    };
    
    return (
      <Badge variant="outline" className={roleColors[role] || "bg-muted"}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  return (
    <TooltipProvider>
      <div className="mt-4 pt-4 border-t border-border">
        {pendingInvitations.length > 0 && (
          <>
            <h4 className="text-sm font-medium mb-3 text-foreground">Pending Invitations</h4>
            <div className="space-y-2">
              {pendingInvitations.map((invitation) => (
                <div 
                  key={invitation.id} 
                  className="flex items-center justify-between py-3 px-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{invitation.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(invitation.role)}
                      <span className="text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat("en-US", {
                          day: "numeric",
                          month: "short"
                        }).format(new Date(invitation.created_at))}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    {getStatusBadge(invitation)}
                    
                    {invitation.token && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopyLink(invitation)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy invitation link</TooltipContent>
                      </Tooltip>
                    )}
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleResend(invitation)}
                          disabled={resendingId === invitation.id}
                        >
                          <RefreshCw className={`h-4 w-4 ${resendingId === invitation.id ? 'animate-spin' : ''}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Resend invitation</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => openRevokeDialog(invitation)}
                          disabled={revokingId === invitation.id}
                        >
                          <X className={`h-4 w-4 ${revokingId === invitation.id ? 'animate-pulse' : ''}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Revoke invitation</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {otherInvitations.length > 0 && (
          <div className={pendingInvitations.length > 0 ? "mt-4" : ""}>
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">Past Invitations</h4>
            <div className="space-y-2">
              {otherInvitations.map((invitation) => (
                <div 
                  key={invitation.id} 
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground truncate">{invitation.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(invitation.role)}
                    </div>
                  </div>
                  {getStatusBadge(invitation)}
                </div>
              ))}
            </div>
          </div>
        )}

        <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke Invitation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to revoke the invitation sent to{" "}
                <span className="font-medium">{selectedInvitation?.email}</span>?
                They will no longer be able to join this deal using the invitation link.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRevoke}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Revoke Invitation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default PendingInvitations;

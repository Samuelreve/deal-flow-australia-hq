
import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRemoveParticipant } from "@/hooks/useRemoveParticipant";
import { DealParticipant } from "@/components/deals/DealParticipants";
import { useAuth } from "@/contexts/AuthContext";

interface RemoveParticipantButtonProps {
  participant: DealParticipant;
  dealId: string;
  currentUserRole?: string;
  dealSellerId?: string;
  onParticipantRemoved?: () => void;
  size?: "sm" | "icon" | undefined;
}

const RemoveParticipantButton: React.FC<RemoveParticipantButtonProps> = ({
  participant,
  dealId,
  currentUserRole,
  dealSellerId,
  onParticipantRemoved,
  size = "icon"
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { user } = useAuth();
  const { removeParticipant, loading } = useRemoveParticipant({
    onSuccess: () => {
      if (onParticipantRemoved) {
        onParticipantRemoved();
      }
    }
  });

  // RBAC: Check if current user can remove this participant
  const canRemove = (() => {
    // Cannot remove if current user is not logged in
    if (!user) return false;
    
    // Cannot remove oneself (except admins)
    if (user.id === participant.user_id && currentUserRole !== 'admin') return false;
    
    // Cannot remove the primary seller/creator
    if (participant.user_id === dealSellerId) return false;
    
    // Role-based permissions
    if (currentUserRole === 'admin') return true; // Admin can remove anyone except seller
    if (currentUserRole === 'seller') {
      return ['buyer', 'lawyer'].includes(participant.role); // Seller can remove buyers and lawyers
    }
    
    // By default, lawyers and buyers cannot remove anyone
    return false;
  })();

  const handleRemove = async () => {
    await removeParticipant(dealId, participant.user_id);
    setShowConfirmDialog(false);
  };

  // Don't render anything if user can't remove this participant
  if (!canRemove) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size={size}
        onClick={() => setShowConfirmDialog(true)}
        disabled={loading}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        {size !== "icon" && <span className="ml-2">Remove</span>}
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Participant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{participant.profile_name || "this participant"}</strong> from this deal?
              <br /><br />
              They will no longer have access to the deal and will be unassigned from any milestones. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                handleRemove();
              }}
              className="bg-red-500 hover:bg-red-700"
            >
              {loading ? "Removing..." : "Remove Participant"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RemoveParticipantButton;

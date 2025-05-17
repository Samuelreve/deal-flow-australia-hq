
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import InvitationForm from './participants/InvitationForm';

// Define props for the ParticipantInvitationForm component
interface ParticipantInvitationFormProps {
  dealId: string;
  isOpen: boolean;
  onClose: () => void;
  onInvitationSent?: () => void;
}

const ParticipantInvitationForm: React.FC<ParticipantInvitationFormProps> = ({ 
  dealId, 
  isOpen,
  onClose,
  onInvitationSent 
}) => {
  const handleInvitationSent = () => {
    if (onInvitationSent) {
      onInvitationSent();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Participant</DialogTitle>
          <DialogDescription>
            Send an invitation to a new participant for this deal.
          </DialogDescription>
        </DialogHeader>
        <InvitationForm 
          dealId={dealId}
          onInvitationSent={handleInvitationSent}
        />
        <DialogClose asChild>
          <Button type="button" variant="outline" className="mt-2">
            Cancel
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default ParticipantInvitationForm;

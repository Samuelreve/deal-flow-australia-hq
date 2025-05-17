
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Define the shape of the invitation form data
interface InvitationFormData {
  inviteeEmail: string;
  inviteeRole: UserRole | '';
}

// Define the expected structure of the successful backend response
interface InvitationResponse {
  success: boolean;
  message: string;
  token?: string;
}

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
  const { user, session } = useAuth();
  
  // State to manage form input values
  const [formData, setFormData] = useState<InvitationFormData>({
    inviteeEmail: '',
    inviteeRole: '',
  });

  // State for loading and error states during form submission
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Define roles available for invitation
  const rolesForInvitation: UserRole[] = ['buyer', 'lawyer', 'admin'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrorMessage(null);
  };

  const handleRoleChange = (value: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      inviteeRole: value,
    }));
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.inviteeEmail || !formData.inviteeRole) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    if (!user) {
      setErrorMessage('You must be logged in to send invitations');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      // Call the Supabase function to create an invitation
      const { data, error } = await supabase.rpc('create_deal_invitation', {
        p_deal_id: dealId,
        p_invitee_email: formData.inviteeEmail,
        p_invitee_role: formData.inviteeRole as UserRole
      });

      if (error) {
        throw new Error(error.message);
      }

      // Properly type the response
      const response = data as InvitationResponse;

      if (!response.success) {
        throw new Error(response.message);
      }

      // Show success message
      toast.success('Invitation sent successfully');
      
      // Reset form data
      setFormData({
        inviteeEmail: '',
        inviteeRole: '',
      });

      // Call the onInvitationSent callback if provided
      if (onInvitationSent) {
        onInvitationSent();
      }

      // Close the dialog
      onClose();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      setErrorMessage(error.message || 'Failed to send invitation');
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
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
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="inviteeEmail">Email Address</Label>
            <Input
              id="inviteeEmail"
              name="inviteeEmail"
              type="email"
              value={formData.inviteeEmail}
              onChange={handleInputChange}
              placeholder="email@example.com"
              disabled={submitting}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="inviteeRole">Role</Label>
            <Select 
              disabled={submitting}
              value={formData.inviteeRole} 
              onValueChange={(value) => handleRoleChange(value as UserRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {rolesForInvitation.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {errorMessage && (
            <div className="text-sm text-red-500">{errorMessage}</div>
          )}
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ParticipantInvitationForm;

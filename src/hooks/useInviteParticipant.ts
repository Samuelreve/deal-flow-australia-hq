
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InvitationFormData, InvitationResponse } from "@/types/invitation";

export function useInviteParticipant(dealId: string, onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteParticipant = async (formData: InvitationFormData): Promise<boolean> => {
    if (!dealId || !formData.inviteeEmail || !formData.inviteeRole) {
      setError("Missing required information");
      toast({
        title: "Invitation Error",
        description: "Please provide all required fields",
        variant: "destructive"
      });
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("You must be logged in to invite participants");
      }

      const { data: result, error } = await supabase.functions.invoke('invite-participant', {
        body: {
          dealId,
          inviteeEmail: formData.inviteeEmail,
          inviteeRole: formData.inviteeRole
        }
      });

      if (error) {
        throw new Error(error.message || "Failed to send invitation");
      }
      
      toast({
        title: "Invitation Sent",
        description: "Invitation has been sent successfully",
        variant: "default"
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send invitation';
      console.error("Invitation error:", err);
      
      setError(errorMessage);
      toast({
        title: "Invitation Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    inviteParticipant,
    isSubmitting,
    error
  };
}


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
        // Try to extract the actual error message from the edge function response
        let errorMessage = "Failed to send invitation";
        if (error.context?.body) {
          try {
            const errorBody = JSON.parse(error.context.body);
            errorMessage = errorBody.error || errorMessage;
          } catch (e) {
            // If parsing fails, use the original error message
            errorMessage = error.message || errorMessage;
          }
        } else {
          errorMessage = error.message || errorMessage;
        }
        throw new Error(errorMessage);
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

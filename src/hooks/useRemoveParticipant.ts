
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UseRemoveParticipantProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useRemoveParticipant({ onSuccess, onError }: UseRemoveParticipantProps = {}) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const removeParticipant = async (dealId: string, userId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to remove participants",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    
    try {
      // Get the auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session found");
      }
      
      // Call the Edge Function to remove the participant
      const response = await fetch(
        `https://wntmgfuclbdrezxcvzmw.supabase.co/functions/v1/remove-participant?dealId=${dealId}&userId=${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
          }
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to remove participant");
      }
      
      // Success notification
      toast({
        title: "Participant removed",
        description: "The participant has been removed from the deal",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error) {
      console.error("Error removing participant:", error);
      
      toast({
        title: "Failed to remove participant",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      
      if (onError) {
        onError(error);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    removeParticipant,
    loading
  };
}

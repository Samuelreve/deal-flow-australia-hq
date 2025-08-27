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
      // First try the edge function
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session found");
        }
        
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
        
        if (response.ok && data.success) {
          toast({
            title: "Participant removed",
            description: "The participant has been removed from the deal",
          });
          
          if (onSuccess) {
            onSuccess();
          }
          
          return true;
        }
      } catch (functionError) {
        console.log('Edge function not available, falling back to direct removal:', functionError);
      }

      // Fallback: Direct database removal
      console.log('Using fallback method for removing participant');
      
      // Check current user permissions first
      const { data: currentUserParticipant, error: permissionError } = await supabase
        .from('deal_participants')
        .select('role')
        .eq('deal_id', dealId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (permissionError) {
        throw new Error('Failed to verify permissions');
      }

      if (!currentUserParticipant) {
        throw new Error('You are not a participant in this deal');
      }

      // Check if user has admin or seller role
      const canRemove = currentUserParticipant.role === 'admin' || currentUserParticipant.role === 'seller';
      if (!canRemove) {
        throw new Error('You do not have permission to remove participants');
      }

      // Get deal details to prevent removing the seller
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .select('seller_id')
        .eq('id', dealId)
        .maybeSingle();

      if (dealError) {
        console.error('Error fetching deal:', dealError);
        throw new Error('Deal not found');
      }

      if (!deal) {
        throw new Error('Deal not found');
      }

      if (userId === deal.seller_id) {
        throw new Error('Cannot remove the deal creator');
      }

      console.log(`🗑️ Attempting to remove participant ${userId} from deal ${dealId}`);

      // Remove the participant
      const { error: removeError, data: deletedData } = await supabase
        .from('deal_participants')
        .delete()
        .eq('deal_id', dealId)
        .eq('user_id', userId)
        .select();

      if (removeError) {
        console.error('❌ Error removing participant:', removeError);
        throw new Error(`Failed to remove participant: ${removeError.message}`);
      }

      console.log('✅ Participant removal result:', deletedData);

      if (!deletedData || deletedData.length === 0) {
        console.warn('⚠️ No participant was removed - user may not be in deal');
        throw new Error('No participant was found to remove');
      }

      // Unassign from milestones (optional, may fail silently)
      try {
        const { error: milestoneError } = await supabase
          .from('milestones')
          .update({ assigned_to: null })
          .eq('deal_id', dealId)
          .eq('assigned_to', userId);

        if (milestoneError) {
          console.warn('⚠️ Could not unassign milestones:', milestoneError);
        } else {
          console.log('✅ Unassigned participant from milestones');
        }
      } catch (milestoneError) {
        console.warn('⚠️ Milestone unassignment failed:', milestoneError);
      }

      console.log('🗑️ Participant removed successfully:', userId);

      toast({
        title: "Participant removed",
        description: "The participant has been removed from the deal",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error: any) {
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
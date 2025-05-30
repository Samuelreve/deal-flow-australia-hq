
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useTempDealCreation = () => {
  const [tempDealId, setTempDealId] = useState<string | undefined>();
  const { user } = useAuth();
  const { toast } = useToast();

  const createTempDealIfNeeded = async (dealTitle: string, dealDescription: string) => {
    // If we already have a temp deal ID, don't create another one
    if (tempDealId) {
      console.log('Using existing temp deal ID:', tempDealId);
      return tempDealId;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a deal",
        variant: "destructive"
      });
      return undefined;
    }

    try {
      console.log('Creating temporary deal for document upload...');
      
      // Create a minimal deal record to get an ID for document storage
      const { data: deal, error } = await supabase
        .from('deals')
        .insert({
          title: dealTitle || 'Untitled Deal',
          description: dealDescription || 'Deal in progress',
          seller_id: user.id,
          status: 'draft'
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating temp deal:', error);
        throw error;
      }

      console.log('Temporary deal created with ID:', deal.id);
      
      // Add the creator as a participant with admin role
      const { error: participantError } = await supabase
        .from('deal_participants')
        .insert({
          deal_id: deal.id,
          user_id: user.id,
          role: 'admin'
        });

      if (participantError) {
        console.error('Error adding user as participant:', participantError);
        // Don't throw here, the deal is created, we can continue
      }

      setTempDealId(deal.id);
      return deal.id;
    } catch (error: any) {
      console.error('Error in createTempDealIfNeeded:', error);
      toast({
        title: "Error Creating Deal",
        description: error.message || "Failed to create deal for document storage",
        variant: "destructive"
      });
      return undefined;
    }
  };

  const clearTempDeal = () => {
    setTempDealId(undefined);
  };

  return {
    tempDealId,
    createTempDealIfNeeded,
    clearTempDeal
  };
};

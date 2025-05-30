
import { supabase } from "@/integrations/supabase/client";

export interface TempDealData {
  title: string;
  description?: string;
  type?: string;
}

export const tempDealService = {
  async createTempDeal(dealData: TempDealData): Promise<{ dealId: string; dealTitle: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Call the Supabase Edge Function to create a temporary deal
      const { data, error } = await supabase.functions.invoke('create-temp-deal', {
        body: {
          title: dealData.title,
          description: dealData.description,
          type: dealData.type || 'analysis'
        }
      });

      if (error) {
        console.error('Error creating temp deal:', error);
        throw new Error(error.message || 'Failed to create temporary deal');
      }

      return {
        dealId: data.dealId,
        dealTitle: data.dealTitle
      };
    } catch (error: any) {
      console.error('Error in tempDealService.createTempDeal:', error);
      throw error;
    }
  }
};

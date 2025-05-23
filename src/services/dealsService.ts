
import { supabase } from "@/integrations/supabase/client";

export interface Deal {
  id: string;
  title: string;
  description?: string;
  status: string;
  health_score: number;
  seller_id: string;
  buyer_id?: string;
  asking_price?: number;
  business_name?: string;
  business_industry?: string;
  target_completion_date?: string;
  created_at: string;
  updated_at: string;
  seller?: { name: string };
  buyer?: { name: string };
}

export const dealsService = {
  async getDeals(): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        seller:profiles!seller_id(name),
        buyer:profiles!buyer_id(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deals:', error);
      throw error;
    }

    return data || [];
  },

  async createDeal(deal: Partial<Deal>): Promise<Deal> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('deals')
      .insert({
        ...deal,
        seller_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating deal:', error);
      throw error;
    }

    return data;
  },

  async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal> {
    const { data, error } = await supabase
      .from('deals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating deal:', error);
      throw error;
    }

    return data;
  }
};

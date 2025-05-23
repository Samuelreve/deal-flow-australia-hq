
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

    // Create the insert data with proper Supabase field mapping
    const insertData: any = {
      title: deal.title,
      description: deal.description,
      seller_id: user.id,
      status: deal.status || 'draft',
      health_score: deal.health_score || 0,
      asking_price: deal.asking_price,
      business_industry: deal.business_industry,
      target_completion_date: deal.target_completion_date
    };

    // Only include buyer_id if it exists
    if (deal.buyer_id) {
      insertData.buyer_id = deal.buyer_id;
    }

    const { data, error } = await supabase
      .from('deals')
      .insert(insertData)
      .select(`
        *,
        seller:profiles!seller_id(name),
        buyer:profiles!buyer_id(name)
      `)
      .single();

    if (error) {
      console.error('Error creating deal:', error);
      throw error;
    }

    return data;
  },

  async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal> {
    // Create the update data with proper Supabase field mapping
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.health_score !== undefined) updateData.health_score = updates.health_score;
    if (updates.asking_price !== undefined) updateData.asking_price = updates.asking_price;
    if (updates.business_industry !== undefined) updateData.business_industry = updates.business_industry;
    if (updates.target_completion_date !== undefined) updateData.target_completion_date = updates.target_completion_date;
    if (updates.buyer_id !== undefined) updateData.buyer_id = updates.buyer_id;

    const { data, error } = await supabase
      .from('deals')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        seller:profiles!seller_id(name),
        buyer:profiles!buyer_id(name)
      `)
      .single();

    if (error) {
      console.error('Error updating deal:', error);
      throw error;
    }

    return data;
  }
};

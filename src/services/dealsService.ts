
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
  async getDeals(pagination?: { page: number; limit: number }): Promise<{ deals: Deal[]; totalCount: number }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { deals: [], totalCount: 0 };
    }

    // First get deal IDs where user is a participant
    const { data: participantData } = await supabase
      .from('deal_participants')
      .select('deal_id')
      .eq('user_id', user.id);

    const participantDealIds = participantData?.map(p => p.deal_id) || [];

    // Build the query to get deals where user is seller, buyer, or participant
    let query = supabase
      .from('deals')
      .select(`
        *,
        seller:profiles!seller_id(name),
        buyer:profiles!buyer_id(name)
      `, { count: 'exact' });

    // Add conditions for seller, buyer, or participant
    if (participantDealIds.length > 0) {
      query = query.or(`seller_id.eq.${user.id},buyer_id.eq.${user.id},id.in.(${participantDealIds.join(',')})`);
    } else {
      query = query.or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`);
    }

    query = query.order('created_at', { ascending: false });

    // Apply pagination if provided
    if (pagination) {
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching deals:', error);
      throw error;
    }

    return { deals: data || [], totalCount: count || 0 };
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
  },

  async deleteDeal(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if user can delete this deal (must be seller or admin)
    const { data: deal, error: fetchError } = await supabase
      .from('deals')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching deal for deletion check:', fetchError);
      throw new Error('Deal not found');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (deal.seller_id !== user.id && profile?.role !== 'admin') {
      throw new Error('Permission denied: Only the seller or admin can delete this deal');
    }

    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting deal:', error);
      throw error;
    }
  }
};

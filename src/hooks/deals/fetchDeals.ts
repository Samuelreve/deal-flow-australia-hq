
import { DealSummary } from "@/types/deal";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches deals from Supabase for a specific user
 */
export const fetchDealsFromSupabase = async (userId?: string): Promise<DealSummary[]> => {
  if (!userId) {
    return [];
  }
  
  try {
    let query = supabase
      .from('deals')
      .select(`
        id,
        title,
        status,
        created_at,
        updated_at,
        health_score,
        seller_id,
        buyer_id,
        profiles!seller_id(name)
      `);
      
    // Rely on RLS to filter deals the user has access to
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching deals:', error);
      return [];
    } 
    
    if (!data) {
      return [];
    }
    
    // Format the deals from Supabase format to our app format
    return data.map(deal => ({
      id: deal.id,
      title: deal.title,
      status: deal.status,
      createdAt: new Date(deal.created_at),
      updatedAt: new Date(deal.updated_at),
      healthScore: deal.health_score,
      sellerId: deal.seller_id,
      buyerId: deal.buyer_id,
      sellerName: deal.profiles?.name || "Unknown",
      businessName: "",
    }));
  } catch (err) {
    console.error('Failed to fetch deals:', err);
    return [];
  }
};


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
    // Query the deals table directly with joins to get required data
    const { data, error } = await supabase
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
        seller:profiles!seller_id(name),
        buyer:profiles!buyer_id(name),
        business_name:title
      `)
      .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`);
    
    if (error) {
      console.error('Error fetching deals:', error);
      return [];
    } 
    
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    // Format the deals from Supabase format to our app format
    return data.map((deal) => ({
      id: deal.id,
      title: deal.title,
      status: deal.status,
      createdAt: new Date(deal.created_at),
      updatedAt: new Date(deal.updated_at),
      healthScore: deal.health_score,
      sellerId: deal.seller_id,
      buyerId: deal.buyer_id,
      sellerName: deal.seller?.name || "Unknown",
      businessName: deal.business_name || "",
      buyerName: deal.buyer?.name || ""
    }));
  } catch (err) {
    console.error('Failed to fetch deals:', err);
    return [];
  }
};

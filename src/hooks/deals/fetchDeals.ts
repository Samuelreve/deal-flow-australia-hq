
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
    // Use a direct RPC call to avoid RLS recursion issues
    const { data, error } = await supabase
      .rpc('get_user_deals', { user_id: userId });
    
    if (error) {
      console.error('Error fetching deals:', error);
      return [];
    } 
    
    if (!data) {
      return [];
    }
    
    // Format the deals from Supabase format to our app format
    return data.map((deal: any) => ({
      id: deal.id,
      title: deal.title,
      status: deal.status,
      createdAt: new Date(deal.created_at),
      updatedAt: new Date(deal.updated_at),
      healthScore: deal.health_score,
      sellerId: deal.seller_id,
      buyerId: deal.buyer_id,
      sellerName: deal.seller_name || "Unknown",
      businessName: deal.business_name || "",
    }));
  } catch (err) {
    console.error('Failed to fetch deals:', err);
    return [];
  }
};

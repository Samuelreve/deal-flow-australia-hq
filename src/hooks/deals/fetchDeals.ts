
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
    // Query deals where user is seller, buyer, or participant
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
        asking_price,
        business_legal_name,
        business_industry,
        target_completion_date,
        seller:profiles!seller_id(name),
        buyer:profiles!buyer_id(name)
      `);
    
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
      askingPrice: deal.asking_price,
      sellerName: deal.seller?.name || "Unknown",
      buyerName: deal.buyer?.name || "",
      businessName: deal.business_legal_name || deal.title || "",
      businessIndustry: deal.business_industry || "",
      targetCompletionDate: deal.target_completion_date ? new Date(deal.target_completion_date) : undefined
    }));
  } catch (err) {
    console.error('Failed to fetch deals:', err);
    return [];
  }
};

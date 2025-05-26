
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
        asking_price,
        business_legal_name,
        business_industry,
        target_completion_date,
        seller:profiles!seller_id(name),
        buyer:profiles!buyer_id(name)
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
    // Explicitly cast data to any[] to resolve type inference issues
    return (data as any[]).map((deal: any) => ({
      id: deal.id,
      title: deal.title,
      status: deal.status,
      createdAt: new Date(deal.created_at),
      updatedAt: new Date(deal.updated_at),
      healthScore: deal.health_score,
      sellerId: deal.seller_id,
      buyerId: deal.buyer_id,
      askingPrice: deal.asking_price,
      sellerName: Array.isArray(deal.seller) ? deal.seller[0]?.name || "Unknown" : deal.seller?.name || "Unknown",
      buyerName: Array.isArray(deal.buyer) ? deal.buyer[0]?.name || "" : deal.buyer?.name || "",
      businessName: deal.business_legal_name || deal.title || "",
      businessIndustry: deal.business_industry || "",
      targetCompletionDate: deal.target_completion_date ? new Date(deal.target_completion_date) : undefined
    }));
  } catch (err) {
    console.error('Failed to fetch deals:', err);
    return [];
  }
};

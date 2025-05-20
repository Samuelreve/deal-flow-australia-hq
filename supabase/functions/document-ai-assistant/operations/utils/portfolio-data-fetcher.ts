
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

/**
 * Get the Supabase admin client
 */
export function getSupabaseAdmin() {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Fetch all deals where the user is a participant along with their milestone and participant information
 */
export async function fetchUserDealPortfolio(userId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // First get all deals where user is a participant
    const { data: participantDeals, error: participantError } = await supabaseAdmin
      .from('deal_participants')
      .select('deal_id')
      .eq('user_id', userId);
    
    if (participantError || !participantDeals || participantDeals.length === 0) {
      return { deals: [] };
    }
    
    const dealIds = participantDeals.map(d => d.deal_id);
    
    // Then get full deal data with related milestones and participants
    const { data: deals, error: dealsError } = await supabaseAdmin
      .from('deals')
      .select(`
        id, 
        title,
        business_legal_name,
        status,
        health_score,
        deal_type,
        asking_price,
        created_at,
        target_completion_date,
        updated_at,
        reason_for_selling,
        seller:profiles!seller_id(name),
        buyer:profiles!buyer_id(name),
        milestones(
          id,
          title,
          status,
          due_date,
          completed_at
        )
      `)
      .in('id', dealIds);
      
    if (dealsError) {
      console.error("Error fetching deals:", dealsError);
      return { deals: [] };
    }
    
    // For each deal, get the participants
    const enrichedDeals = await Promise.all(deals.map(async (deal) => {
      const { data: participants } = await supabaseAdmin
        .from('deal_participants')
        .select(`
          role,
          profile:profiles(name)
        `)
        .eq('deal_id', deal.id);
        
      return {
        ...deal,
        participants: participants || []
      };
    }));
    
    return { deals: enrichedDeals };
  } catch (error) {
    console.error("Error fetching user deal portfolio:", error);
    return { deals: [], error: error.message };
  }
}

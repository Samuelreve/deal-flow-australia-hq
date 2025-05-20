
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
 * Fetch comprehensive deal data for the chat context
 */
export async function fetchDealContextData(dealId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Fetch basic deal information
    const { data: dealData, error: dealError } = await supabaseAdmin
      .from('deals')
      .select(`
        id, 
        title,
        business_legal_name,
        status,
        health_score,
        deal_type,
        asking_price,
        reason_for_selling,
        created_at,
        target_completion_date,
        seller:seller_id(name),
        buyer:buyer_id(name)
      `)
      .eq('id', dealId)
      .single();
      
    if (dealError) throw new Error(`Error fetching deal: ${dealError.message}`);
    if (!dealData) throw new Error("Deal not found");
    
    // Fetch milestones for this deal
    const { data: milestonesData, error: milestonesError } = await supabaseAdmin
      .from('milestones')
      .select('*')
      .eq('deal_id', dealId)
      .order('order_index', { ascending: true });
      
    if (milestonesError) throw new Error(`Error fetching milestones: ${milestonesError.message}`);
    
    // Fetch participants for this deal
    const { data: participantsData, error: participantsError } = await supabaseAdmin
      .from('deal_participants')
      .select(`
        role,
        profiles:user_id (
          name
        )
      `)
      .eq('deal_id', dealId);
      
    if (participantsError) throw new Error(`Error fetching participants: ${participantsError.message}`);
    
    // Fetch recent documents for this deal (last 5)
    const { data: documentsData, error: documentsError } = await supabaseAdmin
      .from('documents')
      .select(`
        id,
        name,
        type,
        status,
        created_at,
        profiles:uploaded_by (
          name
        )
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (documentsError) throw new Error(`Error fetching documents: ${documentsError.message}`);
    
    // Fetch recent comments for this deal (last 10)
    const { data: commentsData, error: commentsError } = await supabaseAdmin
      .from('comments')
      .select(`
        content,
        created_at,
        profiles:user_id (
          name
        )
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (commentsError) throw new Error(`Error fetching comments: ${commentsError.message}`);
    
    return {
      deal: dealData,
      milestones: milestonesData || [],
      participants: participantsData || [],
      documents: documentsData || [],
      comments: commentsData || []
    };
  } catch (error) {
    console.error("Error fetching deal context data:", error);
    throw error;
  }
}

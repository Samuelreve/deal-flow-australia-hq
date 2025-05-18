
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

function getSupabaseAdmin() {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Fetch comprehensive deal data for AI operations
 */
export async function fetchDealData(dealId: string, supabaseAdmin: any = null) {
  try {
    // Get admin client if not provided
    if (!supabaseAdmin) {
      supabaseAdmin = getSupabaseAdmin();
    }
    
    // Fetch basic deal information
    const { data: dealData, error: dealError } = await supabaseAdmin
      .from('deals')
      .select('*, seller:seller_id(name, email), buyer:buyer_id(name, email)')
      .eq('id', dealId)
      .single();
      
    if (dealError) throw new Error(`Error fetching deal: ${dealError.message}`);
    if (!dealData) throw new Error("Deal not found");
    
    // Fetch all participants
    const { data: participants, error: participantsError } = await supabaseAdmin
      .from('deal_participants')
      .select('*, profile:user_id(id, name, email, role)')
      .eq('deal_id', dealId);
      
    if (participantsError) throw new Error(`Error fetching participants: ${participantsError.message}`);
    
    // Group participants by role
    const participantsByRole: Record<string, any[]> = {};
    participants.forEach(participant => {
      const role = participant.role;
      if (!participantsByRole[role]) {
        participantsByRole[role] = [];
      }
      participantsByRole[role].push(participant.profile);
    });
    
    return {
      deal: dealData,
      participants: participantsByRole
    };
  } catch (error) {
    console.error("Error fetching deal data:", error);
    throw error;
  }
}

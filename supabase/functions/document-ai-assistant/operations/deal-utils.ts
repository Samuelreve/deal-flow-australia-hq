
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Function to fetch deal data
export async function fetchDealData(dealId: string) {
  if (!dealId) {
    throw new Error("Deal ID is required");
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not available");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Fetch deal data
    const { data: dealData, error: dealError } = await supabase
      .from('deals')
      .select(`
        id, 
        title, 
        description, 
        value, 
        status,
        created_at,
        seller_id,
        buyer_id
      `)
      .eq('id', dealId)
      .single();
      
    if (dealError) {
      throw dealError;
    }
    
    if (!dealData) {
      throw new Error("Deal not found");
    }
    
    // Fetch participants
    const { data: participantsData, error: participantsError } = await supabase
      .from('deal_participants')
      .select(`
        user_id,
        role,
        profiles:user_id (
          name,
          email
        )
      `)
      .eq('deal_id', dealId);
      
    if (participantsError) {
      throw participantsError;
    }
    
    // Fetch milestones
    const { data: milestonesData, error: milestonesError } = await supabase
      .from('milestones')
      .select('*')
      .eq('deal_id', dealId)
      .order('order_index', { ascending: true });
      
    if (milestonesError) {
      throw milestonesError;
    }
    
    // Fetch documents
    const { data: documentsData, error: documentsError } = await supabase
      .from('documents')
      .select('id, name, created_at')
      .eq('deal_id', dealId);
      
    if (documentsError) {
      throw documentsError;
    }
    
    // Combine all data
    return {
      ...dealData,
      participants: participantsData || [],
      milestones: milestonesData || [],
      documents: documentsData || []
    };
  } catch (error) {
    console.error("Error fetching deal data:", error);
    throw error;
  }
}

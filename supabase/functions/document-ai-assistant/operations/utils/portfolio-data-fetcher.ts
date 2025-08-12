
/**
 * Fetches deal portfolio data for a user
 */
export async function fetchUserDealPortfolio(userId: string) {
  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.21.0');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get all deals where the user is a participant
    const { data: participatedDeals, error: participantError } = await supabase
      .from('deal_participants')
      .select('deal_id')
      .eq('user_id', userId);
      
    if (participantError) throw participantError;
    
    if (!participatedDeals || participatedDeals.length === 0) {
      return { deals: [] };
    }
    
    const dealIds = participatedDeals.map(p => p.deal_id);
    
    // Get detailed deal information
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select(`
        id, 
        title, 
        status, 
        health_score,
        description,
        created_at,
        updated_at,
        deal_type,
        asking_price,
        milestones:milestones(
          id,
          title,
          status,
          completed_at,
          order_index
        ),
        participants:deal_participants(
          id,
          user_id,
          role,
          profiles:profiles(name, avatar_url)
        ),
        documents:documents(
          id,
          name,
          status,
          created_at
        )
      `)
      .in('id', dealIds)
      .order('updated_at', { ascending: false });
      
    if (dealsError) throw dealsError;
    
    return { deals: deals || [] };
  } catch (error) {
    console.error("Error fetching user deal portfolio:", error);
    return { error: error.message, deals: [] };
  }
}

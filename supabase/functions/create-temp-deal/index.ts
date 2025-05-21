
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyAuth } from "../_shared/rbac.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Verify authentication and get user
    const { user, supabase } = await verifyAuth(req);
    
    // Parse request body
    const { title, description = 'Auto-generated for document analysis', type = 'analysis' } = await req.json();
    
    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a new deal
    const { data: dealData, error: dealError } = await supabase
      .from('deals')
      .insert({
        title,
        description,
        creator_id: user.id,
        seller_id: user.id,
        status: 'draft',
        type,
      })
      .select()
      .single();
    
    if (dealError) {
      console.error('Error creating deal:', dealError);
      return new Response(
        JSON.stringify({ error: 'Failed to create deal' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Add the creator as a participant
    const { error: participantError } = await supabase
      .from('deal_participants')
      .insert({
        deal_id: dealData.id,
        user_id: user.id,
        role: 'owner',
        status: 'active'
      });
      
    if (participantError) {
      console.error('Error adding deal participant:', participantError);
      // We'll continue even if adding the participant fails since we have the deal
    }
    
    return new Response(
      JSON.stringify({ dealId: dealData.id, dealTitle: dealData.title }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in create-temp-deal function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

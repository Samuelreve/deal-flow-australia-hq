
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    );
    
    // Create admin client for operations requiring elevated privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('Auth error:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse request body
    const { title, description = 'Auto-generated for document analysis', type = 'analysis' } = await req.json();
    
    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    try {
      // Create a new deal with direct admin access to bypass RLS issues
      const { data: dealData, error: dealError } = await supabaseAdmin
        .from('deals')
        .insert({
          title,
          description,
          seller_id: user.id,
          status: 'draft',
        })
        .select()
        .single();
      
      if (dealError) {
        console.error('Error creating deal:', dealError);
        return new Response(
          JSON.stringify({ error: `Failed to create deal: ${dealError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Add the creator as a participant with admin access to bypass RLS issues
      const { error: participantError } = await supabaseAdmin
        .from('deal_participants')
        .insert({
          deal_id: dealData.id,
          user_id: user.id,
          role: 'owner'
        });
        
      if (participantError) {
        console.error('Error adding deal participant:', participantError);
        // We'll continue even if adding the participant fails since we have the deal
      }
      
      return new Response(
        JSON.stringify({ dealId: dealData.id, dealTitle: dealData.title }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return new Response(
        JSON.stringify({ error: `Database error: ${dbError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in create-temp-deal function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

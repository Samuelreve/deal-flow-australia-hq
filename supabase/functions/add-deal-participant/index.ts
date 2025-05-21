
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with admin privileges
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the current user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify the user's token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse the request body
    const { dealId, userId, role } = await req.json();
    
    if (!dealId || !userId || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: dealId, userId, or role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate that the user exists
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the deal exists
    const { data: dealData, error: dealError } = await supabase
      .from('deals')
      .select('id')
      .eq('id', dealId)
      .single();
      
    if (dealError || !dealData) {
      return new Response(
        JSON.stringify({ error: 'Deal not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the user is already a participant
    const { data: existingParticipant, error: existingParticipantError } = await supabase
      .from('deal_participants')
      .select('id')
      .eq('deal_id', dealId)
      .eq('user_id', userId)
      .single();
      
    if (existingParticipant) {
      // User is already a participant, update their role
      const { data: updatedParticipant, error: updateError } = await supabase
        .from('deal_participants')
        .update({ role })
        .eq('deal_id', dealId)
        .eq('user_id', userId)
        .select()
        .single();
        
      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update participant role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ message: 'Participant role updated', participant: updatedParticipant }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Add the user as a participant
    const { data: newParticipant, error: insertError } = await supabase
      .from('deal_participants')
      .insert({
        deal_id: dealId,
        user_id: userId,
        role: role,
        status: 'active'
      })
      .select()
      .single();
      
    if (insertError) {
      console.error("Error adding deal participant:", insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to add participant to deal' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ message: 'Participant added successfully', participant: newParticipant }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in add-deal-participant function:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

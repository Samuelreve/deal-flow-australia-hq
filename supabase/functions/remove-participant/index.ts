import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow DELETE method
  if (req.method !== "DELETE") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const url = new URL(req.url);
    const dealId = url.searchParams.get('dealId');
    const userId = url.searchParams.get('userId');

    if (!dealId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing dealId or userId parameters' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with the user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            authorization: authHeader,
          },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the current user has permission to remove participants
    const { data: currentUserParticipant, error: participantError } = await supabase
      .from('deal_participants')
      .select('role')
      .eq('deal_id', dealId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (participantError) {
      console.error('Error fetching current user participant:', participantError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify permissions' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!currentUserParticipant) {
      return new Response(
        JSON.stringify({ error: 'You are not a participant in this deal' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has admin or seller role (can remove participants)
    const canRemove = currentUserParticipant.role === 'admin' || currentUserParticipant.role === 'seller';
    if (!canRemove) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to remove participants' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get deal details to check if trying to remove the seller
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('seller_id')
      .eq('id', dealId)
      .single();

    if (dealError) {
      console.error('Error fetching deal:', dealError);
      return new Response(
        JSON.stringify({ error: 'Deal not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent removing the deal creator/seller
    if (userId === deal.seller_id) {
      return new Response(
        JSON.stringify({ error: 'Cannot remove the deal creator' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Start transaction: Remove participant and clean up related data
    const { error: removeError } = await supabase
      .from('deal_participants')
      .delete()
      .eq('deal_id', dealId)
      .eq('user_id', userId);

    if (removeError) {
      console.error('Error removing participant:', removeError);
      return new Response(
        JSON.stringify({ error: 'Failed to remove participant' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Also unassign from any milestones
    const { error: milestoneError } = await supabase
      .from('milestones')
      .update({ assigned_to: null })
      .eq('deal_id', dealId)
      .eq('assigned_to', userId);

    if (milestoneError) {
      console.log('Warning: Could not unassign milestones:', milestoneError);
    }

    // Log the removal for audit trail
    await supabase
      .from('audit_log')
      .insert({
        user_id: user.id,
        event: 'participant_removed',
        metadata: {
          deal_id: dealId,
          removed_user_id: userId,
          removed_by_role: currentUserParticipant.role
        }
      });

    console.log(`Participant ${userId} removed from deal ${dealId} by ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Participant removed successfully' 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in remove-participant function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
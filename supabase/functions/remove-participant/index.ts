
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyAuth, getUserDealRole, getSupabaseAdmin } from "../_shared/rbac.ts";

// Main handler for the remove-participant endpoint
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Parse URL and extract dealId and userId parameters
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    
    // URL format: /remove-participant?dealId=123&userId=456
    const dealId = url.searchParams.get("dealId");
    const userIdToRemove = url.searchParams.get("userId");

    if (!dealId || !userIdToRemove) {
      return new Response(
        JSON.stringify({ error: "Missing dealId or userId parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Authentication - verify the user making the request
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const token = authHeader.split(" ")[1];
    
    try {
      // Authenticate the user making the request
      const authenticatedUser = await verifyAuth(token);
      const authenticatedUserId = authenticatedUser.id;
      
      // 3. Initialize Supabase admin client for privileged operations
      const supabaseAdmin = getSupabaseAdmin();
      
      // 4. Authorization - Check if authenticated user is a participant in the deal
      try {
        // Check if the authenticated user is a participant
        const { data: actorParticipant, error: actorParticipantError } = await supabaseAdmin
          .from('deal_participants')
          .select('role')
          .eq('deal_id', dealId)
          .eq('user_id', authenticatedUserId)
          .single();
        
        if (actorParticipantError || !actorParticipant) {
          return new Response(
            JSON.stringify({ error: "You are not a participant in this deal" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Get the authenticated user's role in the deal
        const actorRole = actorParticipant.role;
        
        // 5. Check if the target user is a participant in the deal
        const { data: targetParticipant, error: targetParticipantError } = await supabaseAdmin
          .from('deal_participants')
          .select('role, user_id')
          .eq('deal_id', dealId)
          .eq('user_id', userIdToRemove)
          .single();
        
        if (targetParticipantError || !targetParticipant) {
          return new Response(
            JSON.stringify({ error: "Target user is not a participant in this deal" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Get the target user's role
        const targetRole = targetParticipant.role;
        
        // 6. Check deal status
        const { data: dealData, error: dealError } = await supabaseAdmin
          .from('deals')
          .select('status, seller_id')
          .eq('id', dealId)
          .single();
        
        if (dealError || !dealData) {
          return new Response(
            JSON.stringify({ error: "Deal not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // 7. Check if deal status allows participant removal
        const dealStatus = dealData.status;
        if (dealStatus === 'completed' || dealStatus === 'cancelled') {
          return new Response(
            JSON.stringify({ error: "Cannot remove participants from completed or cancelled deals" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // 8. Implement RBAC rules for participant removal
        
        // Rule 1: Cannot remove oneself (except admins)
        if (authenticatedUserId === userIdToRemove && actorRole !== 'admin') {
          return new Response(
            JSON.stringify({ error: "You cannot remove yourself from a deal. Please contact an admin." }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Rule 2: Cannot remove the primary seller (creator)
        if (userIdToRemove === dealData.seller_id) {
          return new Response(
            JSON.stringify({ error: "Cannot remove the primary seller/creator of the deal" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Rule 3: Check removal permissions based on roles
        const canRemove = 
          // Admins can remove anyone except the primary seller
          actorRole === 'admin' ||
          // Sellers can remove buyers and lawyers, but not admins or other sellers
          (actorRole === 'seller' && ['buyer', 'lawyer'].includes(targetRole)) ||
          // Lawyers cannot remove anyone
          (actorRole === 'lawyer' && false) ||
          // Buyers cannot remove anyone
          (actorRole === 'buyer' && false);
          
        if (!canRemove) {
          return new Response(
            JSON.stringify({ error: `Your role (${actorRole}) does not allow you to remove ${targetRole} participants` }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // 9. All checks passed, perform the removal
        
        // 9.1. First, unassign user from any milestones in this deal
        await supabaseAdmin
          .from('milestone_assignments')
          .delete()
          .match({
            user_id: userIdToRemove,
          })
          .in('milestone_id', (query) => 
            query
              .select('id')
              .from('milestones')
              .eq('deal_id', dealId)
          );
        
        // 9.2. Remove the participant
        const { error: removalError } = await supabaseAdmin
          .from('deal_participants')
          .delete()
          .eq('deal_id', dealId)
          .eq('user_id', userIdToRemove);
        
        if (removalError) {
          throw new Error(`Failed to remove participant: ${removalError.message}`);
        }
        
        // 10. Create notification for the removed user
        try {
          // Get actor's name for the notification
          const { data: actorProfile } = await supabaseAdmin
            .from('profiles')
            .select('name')
            .eq('id', authenticatedUserId)
            .single();
            
          const actorName = actorProfile?.name || 'A participant';
          
          // Get deal title for the notification
          const { data: dealDetails } = await supabaseAdmin
            .from('deals')
            .select('title')
            .eq('id', dealId)
            .single();
            
          const dealTitle = dealDetails?.title || 'a deal';
          
          // Create notification for the removed user
          await supabaseAdmin
            .from('notifications')
            .insert([
              {
                user_id: userIdToRemove,
                title: "Removed from Deal",
                message: `You were removed from "${dealTitle}" by ${actorName}`,
                type: "info",
                deal_id: dealId
              }
            ]);
            
          // Create notification for other participants
          await supabaseAdmin
            .from('notifications')
            .insert([
              {
                user_id: authenticatedUserId,
                title: "Participant Removed",
                message: `You removed a participant from "${dealTitle}"`,
                type: "info",
                deal_id: dealId
              }
            ]);
        } catch (notificationError) {
          // Log but don't fail if notification creation fails
          console.error("Failed to create notification:", notificationError);
        }
        
        // 11. Return success response
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Participant successfully removed from the deal" 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        
      } catch (error) {
        console.error("Error in participant removal:", error);
        return new Response(
          JSON.stringify({ error: error.message || "Internal server error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (authError) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: "Authentication failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});


// Edge Function for deleting a comment
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { verifyAuth } from "../_shared/rbac.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Only allow DELETE requests
    if (req.method !== "DELETE") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Parse URL to get commentId from path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const commentId = pathParts[pathParts.length - 1];
    
    if (!commentId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: commentId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    
    // 1. Authentication
    const user = await verifyAuth(token);
    const userId = user.id;
    
    // Initialize Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    // 2. Fetch comment details to check authorization
    const { data: comment, error: commentError } = await supabaseAdmin
      .from("comments")
      .select("id, user_id, deal_id")
      .eq("id", commentId)
      .single();
    
    if (commentError || !comment) {
      console.error("Error fetching comment:", commentError);
      return new Response(
        JSON.stringify({ error: "Comment not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // 3. Check if user is the author or has admin/lawyer role in the deal
    let canDelete = comment.user_id === userId;
    
    // If not the author, check if they're an admin or lawyer in the deal
    if (!canDelete) {
      // Get user's role in the deal
      const { data: participant, error: participantError } = await supabaseAdmin
        .from("deal_participants")
        .select("role")
        .eq("deal_id", comment.deal_id)
        .eq("user_id", userId)
        .single();
      
      if (participantError) {
        console.error("Error checking deal participation:", participantError);
      } else if (participant) {
        // Admin or lawyer can delete any comment
        canDelete = ["admin", "lawyer"].includes(participant.role.toLowerCase());
      }
    }
    
    if (!canDelete) {
      return new Response(
        JSON.stringify({ error: "Permission denied: You cannot delete this comment" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // 4. Optional: Check deal status
    const { data: deal, error: dealError } = await supabaseAdmin
      .from("deals")
      .select("status")
      .eq("id", comment.deal_id)
      .single();
    
    if (dealError) {
      console.error("Error fetching deal status:", dealError);
      // Continue anyway since this is just an additional check
    } else if (deal && !["draft", "active", "pending"].includes(deal.status)) {
      return new Response(
        JSON.stringify({ error: `Comment deletion is not allowed when the deal status is "${deal.status}"` }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // 5. Perform deletion
    const { error: deleteError } = await supabaseAdmin
      .from("comments")
      .delete()
      .eq("id", commentId);
    
    if (deleteError) {
      console.error("Error deleting comment:", deleteError);
      return new Response(
        JSON.stringify({ error: "Failed to delete comment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // 6. Return success response
    return new Response(
      JSON.stringify({ message: "Comment deleted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in delete-comment:", error);
    
    // Determine appropriate status code based on error message
    const statusCode = 
      error.message.includes("Unauthorized") ? 401 :
      error.message.includes("Permission denied") ? 403 :
      error.message.includes("not found") ? 404 : 500;
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

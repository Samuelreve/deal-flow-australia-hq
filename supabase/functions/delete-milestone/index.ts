
// Edge Function for deleting a milestone
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { verifyAuth } from "../_shared/rbac.ts";
import { 
  verifyMilestoneExists, 
  canDeleteMilestone 
} from "../_shared/milestone-rbac.ts";

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
    
    // Parse URL to get milestoneId from path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const milestoneId = pathParts[pathParts.length - 1];
    
    if (!milestoneId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: milestoneId" }),
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
    
    // 2. Verify milestone exists and get dealId
    const { exists, dealId, currentStatus } = await verifyMilestoneExists(milestoneId);
    
    if (!exists) {
      return new Response(
        JSON.stringify({ error: "Milestone not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // 3. Check RBAC permissions
    const { canDelete, reason } = await canDeleteMilestone(
      userId,
      milestoneId,
      dealId,
      currentStatus
    );
    
    if (!canDelete) {
      return new Response(
        JSON.stringify({ error: `Permission denied: ${reason}` }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // 4. Perform the deletion
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    // First delete all milestone assignments (assuming ON DELETE CASCADE is not set)
    await supabaseAdmin
      .from("milestone_assignments")
      .delete()
      .eq("milestone_id", milestoneId);
    
    // Then delete the milestone itself
    const { error } = await supabaseAdmin
      .from("milestones")
      .delete()
      .eq("id", milestoneId);
    
    if (error) {
      console.error("Error deleting milestone:", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete milestone" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // 5. Return success response
    return new Response(
      JSON.stringify({ 
        message: "Milestone deleted successfully" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in delete-milestone:", error);
    
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

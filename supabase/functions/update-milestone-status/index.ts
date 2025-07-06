
// Edge Function for updating milestone status
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { verifyAuth } from "../_shared/rbac.ts";
import { 
  verifyMilestoneExists, 
  canUpdateMilestone 
} from "../_shared/milestone-rbac.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Only allow POST/PUT/PATCH requests
    if (!["POST", "PUT", "PATCH"].includes(req.method)) {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Parse request data
    const { milestoneId, newStatus, dueDate, assignedToUserIds } = await req.json();
    
    if (!milestoneId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: milestoneId" }),
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
    const { canUpdate, reason } = await canUpdateMilestone(
      userId,
      milestoneId,
      dealId,
      newStatus,
      currentStatus
    );
    
    if (!canUpdate) {
      return new Response(
        JSON.stringify({ error: `Permission denied: ${reason}` }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // 4. Prepare update data
    const updateData: Record<string, any> = {};
    
    // Only add fields that are provided
    if (newStatus) {
      updateData.status = newStatus;
      
      // If completing the milestone, set completed_at timestamp
      if (newStatus === "completed") {
        updateData.completed_at = new Date().toISOString();
      } else if (currentStatus === "completed") {
        // If un-completing, clear the completed_at timestamp
        updateData.completed_at = null;
      }
    }
    
    if (dueDate !== undefined) {
      updateData.due_date = dueDate;
    }
    
    // 5. Perform the update
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    const { data, error } = await supabaseAdmin
      .from("milestones")
      .update(updateData)
      .eq("id", milestoneId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating milestone:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update milestone" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // 6. Handle milestone assignments if provided
    if (assignedToUserIds !== undefined) {
      // First, remove all current assignments
      await supabaseAdmin
        .from("milestone_assignments")
        .delete()
        .eq("milestone_id", milestoneId);
      
      // Then add new assignments if there are any
      if (Array.isArray(assignedToUserIds) && assignedToUserIds.length > 0) {
        const assignments = assignedToUserIds.map(userId => ({
          milestone_id: milestoneId,
          user_id: userId
        }));
        
        const { error: assignmentError } = await supabaseAdmin
          .from("milestone_assignments")
          .insert(assignments);
        
        if (assignmentError) {
          console.error("Error updating milestone assignments:", assignmentError);
          // Continue anyway since the milestone itself was updated successfully
        }
      }
    }
    
    // 7. Return the updated milestone
    return new Response(
      JSON.stringify({ 
        message: "Milestone updated successfully", 
        milestone: data 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in update-milestone-status:", error);
    
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

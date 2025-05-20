
// Edge Function for document comments management (create, fetch, etc.)
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyAuth } from "../_shared/auth.ts";

// Define the request handler for the Edge Function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Get URL and path parameters
    const url = new URL(req.url);
    const path = url.pathname.split("/");
    const action = path[path.length - 1]; // Last part is the action (e.g., "comments")
    const versionId = path[path.length - 2]; // Second to last part should be versionId
    
    if (!versionId || !action) {
      return new Response(
        JSON.stringify({ error: "Invalid URL format" }),
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
    
    // 1. Authentication - verify the user from token
    const user = await verifyAuth(token);
    const authenticatedUserId = user.id;
    
    // Initialize Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    // 2. Verify Document Version Exists and Get Deal Info
    const { data: versionData, error: versionError } = await supabaseAdmin
      .from("document_versions")
      .select("id, document_id, documents:document_id(deal_id)")
      .eq("id", versionId)
      .single();
    
    if (versionError || !versionData) {
      console.error("Error fetching document version:", versionError);
      return new Response(
        JSON.stringify({ error: "Document version not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const dealId = versionData.documents?.deal_id;
    
    if (!dealId) {
      return new Response(
        JSON.stringify({ error: "Document not properly linked to a deal" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // 3. Verify User is a Deal Participant
    const { data: participantData, error: participantError } = await supabaseAdmin
      .from("deal_participants")
      .select("role")
      .eq("deal_id", dealId)
      .eq("user_id", authenticatedUserId)
      .maybeSingle();
    
    if (participantError) {
      console.error("Error checking deal participation:", participantError);
      return new Response(
        JSON.stringify({ error: "Failed to verify deal participation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!participantData) {
      return new Response(
        JSON.stringify({ error: "Permission denied: Not a participant in this deal" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Handle different actions based on HTTP method and path
    if (action === "comments") {
      // POST /document-versions/:versionId/comments - Create a new comment
      if (req.method === "POST") {
        // Parse request body
        const data = await req.json();
        
        // Validate content
        if (!data.content || typeof data.content !== "string" || data.content.trim() === "") {
          return new Response(
            JSON.stringify({ error: "Comment content is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // 4. Verify if parent comment exists (if provided)
        if (data.parent_comment_id) {
          const { data: parentComment, error: parentError } = await supabaseAdmin
            .from("document_comments")
            .select("id")
            .eq("id", data.parent_comment_id)
            .eq("document_version_id", versionId)
            .single();
          
          if (parentError || !parentComment) {
            return new Response(
              JSON.stringify({ error: "Parent comment not found or not in the same document version" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
        
        // 5. Insert the new comment
        const commentData = {
          document_version_id: versionId,
          user_id: authenticatedUserId,
          content: data.content.trim(),
          page_number: data.page_number || null,
          location_data: data.location_data || null,
          parent_comment_id: data.parent_comment_id || null,
        };
        
        const { data: newComment, error: insertError } = await supabaseAdmin
          .from("document_comments")
          .insert(commentData)
          .select("*, user:profiles(id, name, email, avatar_url)")
          .single();
        
        if (insertError) {
          console.error("Error creating comment:", insertError);
          return new Response(
            JSON.stringify({ error: "Failed to create comment" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // 6. Return the new comment
        return new Response(
          JSON.stringify(newComment),
          { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // GET /document-versions/:versionId/comments - Fetch comments
      else if (req.method === "GET") {
        // 5. Fetch comments for the document version
        const { data: comments, error: commentsError } = await supabaseAdmin
          .from("document_comments")
          .select(`
            *,
            user:profiles(id, name, email, avatar_url),
            replies:document_comments(
              *,
              user:profiles(id, name, email, avatar_url)
            )
          `)
          .eq("document_version_id", versionId)
          .is("parent_comment_id", null)
          .order("created_at", { ascending: true });
        
        if (commentsError) {
          console.error("Error fetching comments:", commentsError);
          return new Response(
            JSON.stringify({ error: "Failed to fetch comments" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // 6. Return the comments
        return new Response(
          JSON.stringify(comments),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Method not allowed
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Unknown action
    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in document-comments edge function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

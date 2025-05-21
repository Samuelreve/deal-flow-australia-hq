
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Handle requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const { action, versionId, userId, annotation, tag, tagId } = await req.json();

    if (!action) {
      return new Response(
        JSON.stringify({ error: "Missing required action parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Handle different actions
    switch (action) {
      case 'addTag':
        return await handleAddTag(tag, versionId, userId);
      
      case 'removeTag':
        return await handleRemoveTag(tagId, versionId, userId);
      
      case 'addAnnotation':
        return await handleAddAnnotation(annotation, versionId, userId);
      
      case 'compare':
        return await handleCompareVersions(req);
      
      default:
        return new Response(
          JSON.stringify({ error: `Unsupported action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Handle adding a tag to a document version
 */
async function handleAddTag(tag: any, versionId: string, userId: string) {
  // Validate parameters
  if (!tag || !versionId || !userId) {
    return new Response(
      JSON.stringify({ error: "Missing required parameters for adding tag" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  try {
    // First, check if the user has access to this document version
    const { data: hasAccess, error: accessError } = await checkUserAccessToVersion(versionId, userId);
    
    if (accessError || !hasAccess) {
      return new Response(
        JSON.stringify({ error: "You don't have permission to add tags to this document version" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Insert the tag
    const { data: tagData, error } = await supabaseClient
      .from('document_version_tags')
      .insert({
        version_id: versionId,
        name: tag.name,
        color: tag.color
      })
      .select('*')
      .single();
    
    if (error) {
      throw error;
    }
    
    // Return the created tag data in our application format
    return new Response(
      JSON.stringify({
        id: tagData.id,
        versionId: tagData.version_id,
        name: tagData.name,
        color: tagData.color,
        createdAt: tagData.created_at
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error adding tag:", error);
    return new Response(
      JSON.stringify({ error: "Failed to add tag", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * Handle removing a tag from a document version
 */
async function handleRemoveTag(tagId: string, versionId: string, userId: string) {
  // Validate parameters
  if (!tagId || !versionId || !userId) {
    return new Response(
      JSON.stringify({ error: "Missing required parameters for removing tag" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  try {
    // First, check if the user has access to this document version
    const { data: hasAccess, error: accessError } = await checkUserAccessToVersion(versionId, userId);
    
    if (accessError || !hasAccess) {
      return new Response(
        JSON.stringify({ error: "You don't have permission to remove tags from this document version" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Delete the tag
    const { error } = await supabaseClient
      .from('document_version_tags')
      .delete()
      .eq('id', tagId)
      .eq('version_id', versionId);
    
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error removing tag:", error);
    return new Response(
      JSON.stringify({ error: "Failed to remove tag", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * Handle adding an annotation to a document version
 */
async function handleAddAnnotation(annotation: any, versionId: string, userId: string) {
  // Validate parameters
  if (!annotation || !annotation.content || !versionId || !userId) {
    return new Response(
      JSON.stringify({ error: "Missing required parameters for adding annotation" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  try {
    // First, check if the user has access to this document version
    const { data: hasAccess, error: accessError } = await checkUserAccessToVersion(versionId, userId);
    
    if (accessError || !hasAccess) {
      return new Response(
        JSON.stringify({ error: "You don't have permission to add annotations to this document version" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Insert the annotation
    const { data: annotationData, error } = await supabaseClient
      .from('document_version_annotations')
      .insert({
        version_id: versionId,
        user_id: userId,
        content: annotation.content
      })
      .select('*')
      .single();
    
    if (error) {
      throw error;
    }
    
    // Return the created annotation data in our application format
    return new Response(
      JSON.stringify({
        id: annotationData.id,
        versionId: annotationData.version_id,
        userId: annotationData.user_id,
        content: annotationData.content,
        createdAt: annotationData.created_at
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error adding annotation:", error);
    return new Response(
      JSON.stringify({ error: "Failed to add annotation", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * Handle comparing two document versions
 */
async function handleCompareVersions(req: Request) {
  try {
    const { versionId1, versionId2, dealId } = await req.json();
    
    if (!versionId1 || !versionId2 || !dealId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters for comparing versions" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the contents of both versions
    // Implementation will depend on how document content is stored and retrieved
    
    // For now, return a mock response
    return new Response(
      JSON.stringify({
        additions: ["Added line 1", "Added line 2"],
        deletions: ["Removed line 1"],
        unchanged: ["Common line 1", "Common line 2"],
        differenceSummary: "2 additions, 1 deletion"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error comparing versions:", error);
    return new Response(
      JSON.stringify({ error: "Failed to compare versions", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * Helper function to check if a user has access to a document version
 */
async function checkUserAccessToVersion(versionId: string, userId: string) {
  // Get the document_id from the version
  const { data: versionData, error: versionError } = await supabaseClient
    .from('document_versions')
    .select('document_id')
    .eq('id', versionId)
    .single();
  
  if (versionError || !versionData) {
    return { data: false, error: versionError };
  }
  
  // Get the deal_id from the document
  const { data: documentData, error: documentError } = await supabaseClient
    .from('documents')
    .select('deal_id')
    .eq('id', versionData.document_id)
    .single();
  
  if (documentError || !documentData) {
    return { data: false, error: documentError };
  }
  
  // Check if the user is a participant in the deal
  const { data: participantData, error: participantError } = await supabaseClient
    .from('deal_participants')
    .select('id')
    .eq('deal_id', documentData.deal_id)
    .eq('user_id', userId);
  
  if (participantError) {
    return { data: false, error: participantError };
  }
  
  // User has access if they are a participant in the deal
  return { data: participantData.length > 0, error: null };
}

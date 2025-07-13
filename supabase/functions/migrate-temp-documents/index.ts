import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders } from "../_shared/cors.ts";

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tempDealId, realDealId } = await req.json();
    
    if (!tempDealId || !realDealId) {
      return new Response(
        JSON.stringify({ error: "Missing tempDealId or realDealId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Supabase URL and service role key from environment variables
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    // Create a Supabase client with the service role key for admin access
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all files from the temporary deal folder
    const { data: tempFiles, error: listError } = await supabaseAdmin.storage
      .from('deal-documents')
      .list(tempDealId);

    if (listError) {
      console.error('Error listing temp files:', listError);
      return new Response(
        JSON.stringify({ error: "Failed to list temporary files" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!tempFiles || tempFiles.length === 0) {
      console.log('No temporary files found to migrate');
      return new Response(
        JSON.stringify({ success: true, migratedFiles: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let migratedFiles = 0;
    const migrationErrors: string[] = [];

    // Migrate each file
    for (const file of tempFiles) {
      try {
        const tempPath = `${tempDealId}/${file.name}`;
        const newPath = `${realDealId}/${file.name}`;

        // Download the file from temp location
        const { data: fileData, error: downloadError } = await supabaseAdmin.storage
          .from('deal-documents')
          .download(tempPath);

        if (downloadError) {
          console.error(`Error downloading file ${tempPath}:`, downloadError);
          migrationErrors.push(`Failed to download ${file.name}: ${downloadError.message}`);
          continue;
        }

        // Upload to new location
        const { error: uploadError } = await supabaseAdmin.storage
          .from('deal-documents')
          .upload(newPath, fileData, {
            upsert: true,
            contentType: file.metadata?.mimetype || 'application/octet-stream'
          });

        if (uploadError) {
          console.error(`Error uploading file ${newPath}:`, uploadError);
          migrationErrors.push(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        // Delete the old file
        const { error: deleteError } = await supabaseAdmin.storage
          .from('deal-documents')
          .remove([tempPath]);

        if (deleteError) {
          console.error(`Error deleting temp file ${tempPath}:`, deleteError);
          migrationErrors.push(`Failed to delete temp ${file.name}: ${deleteError.message}`);
          // Don't continue here, the file was migrated successfully
        }

        migratedFiles++;
        console.log(`Successfully migrated file: ${file.name}`);
      } catch (error) {
        console.error(`Unexpected error migrating file ${file.name}:`, error);
        migrationErrors.push(`Unexpected error with ${file.name}: ${error.message}`);
      }
    }

    // Update document records to point to the real deal
    const { error: updateError } = await supabaseAdmin
      .from('documents')
      .update({ deal_id: realDealId })
      .eq('deal_id', tempDealId);

    if (updateError) {
      console.error('Error updating document records:', updateError);
      migrationErrors.push(`Failed to update document records: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        migratedFiles,
        totalFiles: tempFiles.length,
        errors: migrationErrors
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in migrate-temp-documents:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
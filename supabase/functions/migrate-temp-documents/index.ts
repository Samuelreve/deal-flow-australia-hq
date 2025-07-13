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

    let migratedFiles = 0;
    const migrationErrors: string[] = [];
    
    // Define buckets to check for temporary files
    const bucketsToCheck = ['deal_documents', 'business_document'];
    
    for (const bucketName of bucketsToCheck) {
      console.log(`Checking bucket ${bucketName} for temporary files`);
      
      // Get all files from the temporary deal folder in this bucket
      const { data: tempFiles, error: listError } = await supabaseAdmin.storage
        .from(bucketName)
        .list(tempDealId);

      if (listError) {
        console.error(`Error listing temp files from ${bucketName}:`, listError);
        migrationErrors.push(`Failed to list files from ${bucketName}: ${listError.message}`);
        continue;
      }

      if (!tempFiles || tempFiles.length === 0) {
        console.log(`No temporary files found in ${bucketName} to migrate`);
        continue;
      }

      console.log(`Found ${tempFiles.length} files in ${bucketName} to migrate`);

      // Migrate each file from this bucket
      for (const file of tempFiles) {
        try {
          const tempPath = `${tempDealId}/${file.name}`;
          const newPath = `${realDealId}/${file.name}`;

          // Download the file from temp location
          const { data: fileData, error: downloadError } = await supabaseAdmin.storage
            .from(bucketName)
            .download(tempPath);

          if (downloadError) {
            console.error(`Error downloading file ${tempPath} from ${bucketName}:`, downloadError);
            migrationErrors.push(`Failed to download ${file.name} from ${bucketName}: ${downloadError.message}`);
            continue;
          }

          // Upload to deal_documents bucket (destination for all documents)
          const { error: uploadError } = await supabaseAdmin.storage
            .from('deal_documents')
            .upload(newPath, fileData, {
              upsert: true,
              contentType: file.metadata?.mimetype || 'application/octet-stream'
            });

          if (uploadError) {
            console.error(`Error uploading file ${newPath} to deal_documents:`, uploadError);
            migrationErrors.push(`Failed to upload ${file.name} to deal_documents: ${uploadError.message}`);
            continue;
          }

          // Delete the old file from source bucket
          const { error: deleteError } = await supabaseAdmin.storage
            .from(bucketName)
            .remove([tempPath]);

          if (deleteError) {
            console.error(`Error deleting temp file ${tempPath} from ${bucketName}:`, deleteError);
            migrationErrors.push(`Failed to delete temp ${file.name} from ${bucketName}: ${deleteError.message}`);
            // Don't continue here, the file was migrated successfully
          }

          migratedFiles++;
          console.log(`Successfully migrated file: ${file.name} from ${bucketName} to deal_documents`);
        } catch (error) {
          console.error(`Unexpected error migrating file ${file.name} from ${bucketName}:`, error);
          migrationErrors.push(`Unexpected error with ${file.name} from ${bucketName}: ${error.message}`);
        }
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
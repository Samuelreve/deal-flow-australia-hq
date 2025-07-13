import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string
          deal_id: string
          storage_path: string
          name: string
        }
      }
      document_versions: {
        Row: {
          id: string
          document_id: string
          storage_path: string
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting document path migration...')

    // Get all documents that need migration
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('id, deal_id, storage_path, name')

    if (docsError) {
      throw docsError
    }

    // Get all document versions that need migration
    const { data: versions, error: versionsError } = await supabase
      .from('document_versions')
      .select('id, document_id, storage_path')

    if (versionsError) {
      throw versionsError
    }

    const results = {
      documentsProcessed: 0,
      documentsMigrated: 0,
      versionsProcessed: 0,
      versionsMigrated: 0,
      errors: [] as string[]
    }

    // Process documents
    for (const doc of documents || []) {
      results.documentsProcessed++
      
      try {
        // Check if path needs migration (contains more than just dealId/filename)
        const pathParts = doc.storage_path.split('/')
        
        // If path has more than 2 parts (dealId/filename), it needs migration
        if (pathParts.length > 2) {
          // Extract filename from the old path
          const filename = pathParts[pathParts.length - 1]
          const newPath = `${doc.deal_id}/${filename}`
          
          // Check if file exists at old location
          const { data: oldFile, error: oldFileError } = await supabase.storage
            .from('deal-documents')
            .download(doc.storage_path)
            
          if (!oldFileError && oldFile) {
            // Move file to new location
            const { error: uploadError } = await supabase.storage
              .from('deal-documents')
              .upload(newPath, oldFile, { upsert: true })
              
            if (!uploadError) {
              // Update database with new path (store just filename)
              const { error: updateError } = await supabase
                .from('documents')
                .update({ storage_path: filename })
                .eq('id', doc.id)
                
              if (!updateError) {
                // Delete old file
                await supabase.storage
                  .from('deal-documents')
                  .remove([doc.storage_path])
                  
                results.documentsMigrated++
                console.log(`Migrated document: ${doc.storage_path} -> ${newPath}`)
              } else {
                results.errors.push(`Failed to update document ${doc.id}: ${updateError.message}`)
              }
            } else {
              results.errors.push(`Failed to upload document ${doc.id}: ${uploadError.message}`)
            }
          } else {
            // File doesn't exist at old location, just update database
            const filename = pathParts[pathParts.length - 1]
            const { error: updateError } = await supabase
              .from('documents')
              .update({ storage_path: filename })
              .eq('id', doc.id)
              
            if (!updateError) {
              results.documentsMigrated++
              console.log(`Updated document path in DB: ${doc.id}`)
            } else {
              results.errors.push(`Failed to update document ${doc.id}: ${updateError.message}`)
            }
          }
        }
      } catch (error) {
        results.errors.push(`Error processing document ${doc.id}: ${error.message}`)
      }
    }

    // Process document versions
    for (const version of versions || []) {
      results.versionsProcessed++
      
      try {
        // Check if path needs migration
        const pathParts = version.storage_path.split('/')
        
        if (pathParts.length > 2) {
          // Get the document to find deal_id
          const { data: doc } = await supabase
            .from('documents')
            .select('deal_id')
            .eq('id', version.document_id)
            .single()
            
          if (doc) {
            const filename = pathParts[pathParts.length - 1]
            const newPath = `${doc.deal_id}/${filename}`
            
            // Check if file exists at old location
            const { data: oldFile, error: oldFileError } = await supabase.storage
              .from('deal-documents')
              .download(version.storage_path)
              
            if (!oldFileError && oldFile) {
              // Move file to new location
              const { error: uploadError } = await supabase.storage
                .from('deal-documents')
                .upload(newPath, oldFile, { upsert: true })
                
              if (!uploadError) {
                // Update database with new path (store just filename)
                const { error: updateError } = await supabase
                  .from('document_versions')
                  .update({ storage_path: filename })
                  .eq('id', version.id)
                  
                if (!updateError) {
                  // Delete old file
                  await supabase.storage
                    .from('deal-documents')
                    .remove([version.storage_path])
                    
                  results.versionsMigrated++
                  console.log(`Migrated version: ${version.storage_path} -> ${newPath}`)
                } else {
                  results.errors.push(`Failed to update version ${version.id}: ${updateError.message}`)
                }
              } else {
                results.errors.push(`Failed to upload version ${version.id}: ${uploadError.message}`)
              }
            } else {
              // File doesn't exist at old location, just update database
              const { error: updateError } = await supabase
                .from('document_versions')
                .update({ storage_path: filename })
                .eq('id', version.id)
                
              if (!updateError) {
                results.versionsMigrated++
                console.log(`Updated version path in DB: ${version.id}`)
              } else {
                results.errors.push(`Failed to update version ${version.id}: ${updateError.message}`)
              }
            }
          }
        }
      } catch (error) {
        results.errors.push(`Error processing version ${version.id}: ${error.message}`)
      }
    }

    console.log('Migration completed:', results)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Document path migration completed',
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Migration error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
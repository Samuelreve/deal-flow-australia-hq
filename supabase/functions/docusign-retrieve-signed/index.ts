import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface DocuSignTokenData {
  access_token: string;
  account_id: string;
  base_uri: string;
}

serve(async (req: Request) => {
  console.log('=== DocuSign Retrieve Signed Function Started ===');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { dealId, userRole } = await req.json();

    if (!dealId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: dealId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Looking for signed documents for deal:', dealId);

    // Get completed document signatures for this deal
    const { data: signatures, error: sigError } = await supabase
      .from('document_signatures')
      .select(`
        *,
        documents(id, name)
      `)
      .eq('deal_id', dealId)
      .eq('status', 'completed');

    if (sigError) {
      console.error('❌ Error fetching signatures:', sigError);
      throw new Error('Failed to fetch signature records');
    }

    if (!signatures || signatures.length === 0) {
      console.log('📄 No completed signatures found for deal:', dealId);
      return new Response(
        JSON.stringify({ message: 'No signed documents available yet' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📄 Found completed signatures:', signatures.length);

    // Get DocuSign access token
    const { data: tokens, error: tokenError } = await supabase
      .from('docusign_tokens')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (tokenError || !tokens) {
      console.log('❌ No DocuSign tokens found');
      throw new Error('DocuSign authentication required');
    }

    console.log('✅ Found DocuSign tokens');

    const processedDocuments = [];

    // Process each completed signature
    for (const signature of signatures) {
      try {
        console.log('📥 Processing envelope:', signature.envelope_id);
        
        // Get documents in the envelope
        const envelopeDocsUrl = `${tokens.base_uri}/restapi/v2.1/accounts/${tokens.account_id}/envelopes/${signature.envelope_id}/documents`;
        
        const docsResponse = await fetch(envelopeDocsUrl, {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Accept': 'application/json'
          }
        });

        if (!docsResponse.ok) {
          console.error('❌ Failed to get envelope documents:', await docsResponse.text());
          continue;
        }

        const docsData = await docsResponse.json();
        console.log('📄 Documents in envelope:', docsData);
        
        // Find the actual document (not certificate)
        const document = docsData.envelopeDocuments?.find((doc: any) => 
          doc.type === 'content' && doc.documentId !== 'certificate'
        );
        
        if (!document) {
          console.log('❌ No valid document found in envelope');
          continue;
        }

        // Download the specific document using the provided URL format
        const docuSignUrl = `${tokens.base_uri}/restapi/v2.1/accounts/${tokens.account_id}/envelopes/${signature.envelope_id}/documents/${document.documentId}`;
        
        console.log('📥 Downloading from:', docuSignUrl);
        
        const docResponse = await fetch(docuSignUrl, {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Accept': 'application/pdf'
          }
        });

        if (!docResponse.ok) {
          console.error('❌ Failed to download document:', await docResponse.text());
          continue;
        }

        const pdfBuffer = await docResponse.arrayBuffer();
        const uint8Array = new Uint8Array(pdfBuffer);
        
        // Generate signed document name
        const originalDoc = signature.documents;
        const fileName = `SIGNED_${originalDoc?.name || 'document.pdf'}`;
        const filePath = `${dealId}/${fileName}`;
        
        // Save to Signed Documents bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('Signed Documents')
          .upload(filePath, uint8Array, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (uploadError) {
          console.error('❌ Error uploading signed document:', uploadError);
          continue;
        }

        // Get signed URL for download
        const { data: signedUrlData } = await supabase.storage
          .from('Signed Documents')
          .createSignedUrl(filePath, 60 * 60 * 24); // 24 hours

        processedDocuments.push({
          envelope_id: signature.envelope_id,
          name: fileName,
          url: signedUrlData?.signedUrl,
          size: uint8Array.length
        });

        console.log('✅ Successfully downloaded signed document:', fileName);

      } catch (error) {
        console.error('❌ Error processing envelope:', signature.envelope_id, error);
        continue;
      }
    }

    console.log('✅ Successfully processed signed documents');

    return new Response(
      JSON.stringify({
        success: true,
        message: `${processedDocuments.length} signed document(s) downloaded and saved`,
        processedDocuments
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('DocuSign retrieve signed document error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to retrieve signed document from DocuSign'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
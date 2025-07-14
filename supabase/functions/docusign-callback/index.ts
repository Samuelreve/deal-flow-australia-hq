import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const event = url.searchParams.get('event');
    const envelopeId = url.searchParams.get('envelopeId');

    console.log('DocuSign callback:', { event, envelopeId });

    if (event === 'signing_complete' && envelopeId) {
      // Get the signature record to retrieve document and deal info
      const { data: signature, error: sigError } = await supabase
        .from('document_signatures')
        .select('document_id, deal_id')
        .eq('envelope_id', envelopeId)
        .single();

      if (sigError || !signature) {
        console.error('Error finding signature record:', sigError);
      } else {
        // Call the retrieve signed document function
        try {
          const retrieveResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/docusign-retrieve-signed`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              envelopeId: envelopeId,
              documentId: signature.document_id,
              dealId: signature.deal_id
            })
          });

          if (retrieveResponse.ok) {
            console.log('✅ Signed document retrieved and uploaded successfully');
          } else {
            console.error('Failed to retrieve signed document:', await retrieveResponse.text());
          }
        } catch (retrieveError) {
          console.error('Error calling retrieve signed document function:', retrieveError);
        }
      }

      // Update signature status to completed
      const { error } = await supabase
        .from('document_signatures')
        .update({ 
          status: 'completed',
          signed_at: new Date().toISOString()
        })
        .eq('envelope_id', envelopeId);

      if (error) {
        console.error('Error updating signature status:', error);
      } else {
        console.log('Signature status updated successfully');
      }
    }

    // Return a simple success page
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Document Signing Complete</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .success { color: #28a745; font-size: 24px; margin-bottom: 20px; }
            .message { color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="success">✓ Document Signing Complete</div>
          <div class="message">
            Thank you for signing the document. You can now close this window.
          </div>
          <script>
            // Auto-close window after 3 seconds
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/html' 
      },
    });

  } catch (error: any) {
    console.error('DocuSign callback error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
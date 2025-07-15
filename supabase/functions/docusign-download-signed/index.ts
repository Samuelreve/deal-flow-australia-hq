import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Function to create JWT token for DocuSign authentication
async function createDocuSignJWT(): Promise<string> {
  const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
  const userId = Deno.env.get('DOCUSIGN_USER_ID');
  const privateKey = Deno.env.get('DOCUSIGN_PRIVATE_KEY');
  
  if (!integrationKey || !userId || !privateKey) {
    throw new Error('Missing DocuSign configuration');
  }

  // Create JWT header
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  // Create JWT payload
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: integrationKey,
    sub: userId,
    aud: 'account-d.docusign.com',
    iat: now,
    exp: now + 3600, // 1 hour
    scope: 'signature'
  };

  // Encode header and payload
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // Create signature (simplified - in production, use proper RSA signing)
  const message = `${encodedHeader}.${encodedPayload}`;
  
  // For now, return a mock JWT - in production, implement proper RSA signing
  const signature = btoa(message);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Function to get access token using JWT
async function getAccessToken(): Promise<{ access_token: string; base_uri: string; account_id: string }> {
  const jwt = await createDocuSignJWT();
  
  const response = await fetch('https://account-d.docusign.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ DocuSign JWT authentication failed:', error);
    throw new Error('DocuSign authentication failed');
  }

  const tokenData = await response.json();
  
  // Get user info to get account details
  const userInfoResponse = await fetch('https://account-d.docusign.com/oauth/userinfo', {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`
    }
  });

  const userInfo = await userInfoResponse.json();
  const account = userInfo.accounts[0]; // Use first account
  
  return {
    access_token: tokenData.access_token,
    base_uri: account.base_uri,
    account_id: account.account_id
  };
}

// Function to download document from DocuSign following the tutorial
async function downloadDocumentFromDocuSign(
  accessToken: string, 
  baseUri: string, 
  accountId: string, 
  envelopeId: string, 
  documentId: string = 'combined'
): Promise<Uint8Array> {
  
  console.log('📥 Downloading document from DocuSign...');
  console.log('🔗 Base URI:', baseUri);
  console.log('🏢 Account ID:', accountId);
  console.log('📋 Envelope ID:', envelopeId);
  console.log('📄 Document ID:', documentId);

  // Step 1: Check envelope status first (as per tutorial best practice)
  const envelopeStatusUrl = `${baseUri}/v2.1/accounts/${accountId}/envelopes/${envelopeId}`;
  
  console.log('🔍 Checking envelope status at:', envelopeStatusUrl);
  
  const statusResponse = await fetch(envelopeStatusUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  if (!statusResponse.ok) {
    const error = await statusResponse.text();
    console.error('❌ Failed to get envelope status:', error);
    throw new Error(`Failed to get envelope status: ${statusResponse.status} ${statusResponse.statusText}`);
  }

  const envelopeStatus = await statusResponse.json();
  console.log('📋 Envelope status:', envelopeStatus.status);
  
  if (envelopeStatus.status !== 'completed') {
    throw new Error(`Envelope is not completed. Current status: ${envelopeStatus.status}`);
  }

  // Step 2: Download the document (following tutorial API structure)
  const downloadUrl = `${baseUri}/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents/${documentId}`;
  
  console.log('📥 Downloading from:', downloadUrl);
  
  const downloadResponse = await fetch(downloadUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/pdf', // Specify PDF format
      'Content-Type': 'application/json'
    }
  });

  if (!downloadResponse.ok) {
    const error = await downloadResponse.text();
    console.error('❌ Failed to download document:', error);
    throw new Error(`Failed to download document: ${downloadResponse.status} ${downloadResponse.statusText}`);
  }

  console.log('✅ Document downloaded successfully');
  
  // Convert response to Uint8Array
  const arrayBuffer = await downloadResponse.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

serve(async (req: Request) => {
  console.log('=== DocuSign Download Signed Document Function Started ===');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { envelopeId, dealId, documentId = 'combined' } = await req.json();

    if (!envelopeId || !dealId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: envelopeId and dealId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎯 Processing request for envelope:', envelopeId, 'deal:', dealId);

    // Step 1: Get OAuth access token using JWT authentication
    console.log('🔐 Step 1: Obtaining DocuSign access token via JWT...');
    const { access_token, base_uri, account_id } = await getAccessToken();
    console.log('✅ Successfully obtained access token');

    // Step 2: Download document from DocuSign
    console.log('📥 Step 2: Downloading document from DocuSign...');
    const documentBytes = await downloadDocumentFromDocuSign(
      access_token,
      base_uri,
      account_id,
      envelopeId,
      documentId
    );

    console.log(`📊 Downloaded document size: ${documentBytes.length} bytes`);

    // Step 3: Get original document name from signature record
    const { data: signature } = await supabase
      .from('document_signatures')
      .select('document_id')
      .eq('envelope_id', envelopeId)
      .single();

    let fileName = 'signed_document.pdf';
    
    if (signature?.document_id) {
      const { data: originalDoc } = await supabase
        .from('documents')
        .select('name')
        .eq('id', signature.document_id)
        .single();
      
      if (originalDoc?.name) {
        fileName = `SIGNED_${originalDoc.name}`;
      }
    }

    // Step 4: Save to Supabase Storage
    console.log('💾 Step 3: Saving to Supabase storage...');
    const storagePath = `${dealId}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('deal_documents')
      .upload(storagePath, documentBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Storage upload failed:', uploadError);
      throw new Error('Failed to save document to storage');
    }

    console.log('✅ Document saved to storage:', storagePath);

    // Step 5: Create document record in database
    const { data: newDoc, error: createError } = await supabase
      .from('documents')
      .insert({
        deal_id: dealId,
        name: fileName,
        storage_path: storagePath,
        size: documentBytes.length,
        type: 'application/pdf',
        status: 'signed',
        category: 'signed_contract',
        uploaded_by: '00000000-0000-0000-0000-000000000000', // System user
        version: 1
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Failed to create document record:', createError);
      throw new Error('Failed to create document record');
    }

    // Step 6: Create document version record
    await supabase
      .from('document_versions')
      .insert({
        document_id: newDoc.id,
        version_number: 1,
        storage_path: storagePath,
        size: documentBytes.length,
        type: 'application/pdf',
        uploaded_by: newDoc.uploaded_by,
        description: 'Signed document downloaded from DocuSign'
      });

    // Step 7: Update signature status
    await supabase
      .from('document_signatures')
      .update({ 
        status: 'completed',
        signed_at: new Date().toISOString()
      })
      .eq('envelope_id', envelopeId);

    console.log('✅ Successfully downloaded and processed signed document');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Signed document downloaded and added to Documents tab',
        document: {
          id: newDoc.id,
          name: fileName,
          size: documentBytes.length,
          envelope_id: envelopeId
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('DocuSign download error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to download signed document from DocuSign'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { encode as base64UrlEncode } from "https://deno.land/std@0.190.0/encoding/base64url.ts";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// DocuSign OAuth endpoints (sandbox)
const DOCUSIGN_AUTH_BASE_URL = "https://account-d.docusign.com";
// DocuSign API base for sandbox
const DOCUSIGN_API_BASE_URL = "https://demo.docusign.net";

interface DocuSignRequest {
  documentId: string;
  dealId: string;
  signerEmail: string;
  signerName: string;
  signerRole: "buyer" | "seller" | "admin";
  buyerEmail?: string;
  buyerName?: string;
  signaturePositions?: Array<{
    email: string;
    name: string;
    recipientId: string;
    xPosition: string;
    yPosition: string;
    pageNumber: string;
  }>;
}

// Cache for JWT access token (valid for 1 hour)
let cachedAccessToken: { token: string; expiresAt: number } | null = null;

serve(async (req: Request) => {
  console.log("=== DocuSign Function Started ===");
  console.log("Request method:", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const operation = url.pathname.split("/").pop();

    console.log("Operation:", operation);

    if (operation === "status") {
      return await handleStatusRequest();
    }

    // Default signing operation
    return await handleSigningRequest(req);
  } catch (error: any) {
    console.error("DocuSign error:", error);
    return new Response(JSON.stringify({ error: error.message, details: error.name }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/**
 * Handle status request - check if JWT Grant credentials are configured
 */
async function handleStatusRequest(): Promise<Response> {
  const integrationKey = Deno.env.get("DOCUSIGN_INTEGRATION_KEY");
  const privateKey = Deno.env.get("DOCUSIGN_PRIVATE_KEY");
  const userId = Deno.env.get("DOCUSIGN_USER_ID");
  const accountId = Deno.env.get("DOCUSIGN_ACCOUNT_ID");

  const configured = !!(integrationKey && privateKey && userId && accountId);

  return new Response(
    JSON.stringify({
      configured,
      hasIntegrationKey: !!integrationKey,
      hasPrivateKey: !!privateKey,
      hasUserId: !!userId,
      hasAccountId: !!accountId,
      message: configured ? "DocuSign JWT Grant is configured" : "DocuSign JWT Grant credentials not fully configured",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    },
  );
}

/**
 * Generate JWT and exchange for access token using JWT Grant flow
 */
async function getJWTAccessToken(): Promise<string> {
  // Check cache first
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60000) {
    console.log("Using cached access token");
    return cachedAccessToken.token;
  }

  const integrationKey = Deno.env.get("DOCUSIGN_INTEGRATION_KEY");
  const privateKeyPem = Deno.env.get("DOCUSIGN_PRIVATE_KEY");
  const userId = Deno.env.get("DOCUSIGN_USER_ID");

  if (!integrationKey || !privateKeyPem || !userId) {
    throw new Error(
      "Missing DocuSign JWT Grant credentials (DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_PRIVATE_KEY, DOCUSIGN_USER_ID)",
    );
  }

  console.log("Generating JWT for DocuSign authentication...");

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600; // 1 hour expiration

  // JWT Header
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  // JWT Payload
  const payload = {
    iss: integrationKey,
    sub: userId,
    aud: "account-d.docusign.com", // Sandbox
    iat: now,
    exp: exp,
    scope: "signature impersonation",
  };

  // Encode header and payload
  const encodedHeader = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  // Sign the JWT with RSA-SHA256
  const signature = await signWithRSA(signingInput, privateKeyPem);
  const jwt = `${signingInput}.${signature}`;

  console.log("JWT generated, exchanging for access token...");

  // Exchange JWT for access token
  const response = await fetch(`${DOCUSIGN_AUTH_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("JWT Grant token exchange failed:", response.status, errorText);
    throw new Error(`JWT Grant failed: ${response.status} - ${errorText}`);
  }

  const tokenData = await response.json();
  console.log("✅ Successfully obtained access token via JWT Grant");

  // Cache the token
  cachedAccessToken = {
    token: tokenData.access_token,
    expiresAt: Date.now() + tokenData.expires_in * 1000,
  };

  return tokenData.access_token;
}

/**
 * Sign data with RSA private key
 */
async function signWithRSA(data: string, privateKeyPem: string): Promise<string> {
  // Clean and normalize the private key
  let cleanKey = privateKeyPem
    .replace(/\\n/g, "\n")
    .replace(/-----BEGIN RSA PRIVATE KEY-----/g, "")
    .replace(/-----END RSA PRIVATE KEY-----/g, "")
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");

  // Decode base64 key
  const binaryKey = Uint8Array.from(atob(cleanKey), (c) => c.charCodeAt(0));

  // Import the key
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  // Sign the data
  const signatureBuffer = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(data));

  // Convert to base64url
  return base64UrlEncode(new Uint8Array(signatureBuffer));
}

/**
 * Handle the main signing request using JWT Grant authentication
 */
async function handleSigningRequest(req: Request): Promise<Response> {
  console.log("=== Starting DocuSign Signing Request (JWT Grant) ===");

  // Get authenticated user from request
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Authorization required" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Parse request body
  const requestData: DocuSignRequest = await req.json();
  console.log("Request data:", JSON.stringify(requestData, null, 2));

  const { documentId, dealId, signerEmail, signerName, signerRole, signaturePositions } = requestData;

  if (!documentId || !dealId || !signerEmail || !signerName) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: documentId, dealId, signerEmail, signerName" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verify user authentication
  const jwt = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(jwt);

  if (userError || !user) {
    console.error("User auth error:", userError);
    return new Response(JSON.stringify({ error: "Invalid authentication token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log("Authenticated user:", user.id);

  // Get DocuSign access token via JWT Grant
  let accessToken: string;
  try {
    accessToken = await getJWTAccessToken();
  } catch (error: any) {
    console.error("Failed to get JWT access token:", error);
    return new Response(
      JSON.stringify({
        error: "DocuSign authentication failed",
        message: error.message,
        hint: "Ensure DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_PRIVATE_KEY, DOCUSIGN_USER_ID, and DOCUSIGN_ACCOUNT_ID secrets are configured",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Get account ID from environment
  const accountId = Deno.env.get("DOCUSIGN_ACCOUNT_ID");
  if (!accountId) {
    return new Response(JSON.stringify({ error: "DOCUSIGN_ACCOUNT_ID not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log("Using DocuSign account:", accountId);

  // Get document from storage
  const { data: documentRecord, error: docError } = await supabase
    .from("documents")
    .select("storage_path, name")
    .eq("id", documentId)
    .single();

  if (docError || !documentRecord) {
    console.error("Document fetch error:", docError);
    return new Response(JSON.stringify({ error: "Document not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log("Document record:", documentRecord);

  // Try to download document from storage
  const pathsToTry = [
    documentRecord.storage_path,
    `${dealId}/${documentRecord.storage_path}`,
    documentRecord.storage_path.includes("/")
      ? documentRecord.storage_path
      : `${dealId}/${documentRecord.storage_path}`,
  ];

  let downloadedData: Blob | null = null;

  for (const path of pathsToTry) {
    console.log("Trying to download from path:", path);
    const { data, error } = await supabase.storage.from("deal_documents").download(path);

    if (!error && data) {
      downloadedData = data;
      console.log("Successfully downloaded from:", path);
      break;
    }
    console.log("Failed to download from path:", path, error?.message);
  }

  if (!downloadedData) {
    return new Response(JSON.stringify({ error: "Failed to download document from storage" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Convert to base64
  const arrayBuffer = await downloadedData.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const documentBase64 = btoa(binary);

  console.log("Document converted to base64, length:", documentBase64.length);

  // Build signers
  const signers: any[] = [];

  if (signaturePositions && signaturePositions.length > 0) {
    signaturePositions.forEach((pos, index) => {
      signers.push({
        email: pos.email,
        name: pos.name,
        recipientId: pos.recipientId || String(index + 1),
        routingOrder: String(index + 1),
        tabs: {
          signHereTabs: [
            {
              documentId: "1",
              pageNumber: pos.pageNumber || "1",
              xPosition: pos.xPosition || "100",
              yPosition: pos.yPosition || "100",
            },
          ],
        },
      });
    });
  } else {
    signers.push({
      email: signerEmail,
      name: signerName,
      recipientId: "1",
      routingOrder: "1",
      tabs: {
        signHereTabs: [
          {
            documentId: "1",
            pageNumber: "1",
            xPosition: "100",
            yPosition: "700",
          },
        ],
      },
    });
  }

  console.log("Signers:", JSON.stringify(signers, null, 2));

  // Create envelope using DocuSign REST API
  const envelopeDefinition = {
    emailSubject: `Please sign: ${documentRecord.name}`,
    documents: [
      {
        documentBase64: documentBase64,
        documentId: "1",
        fileExtension: documentRecord.name.split(".").pop() || "pdf",
        name: documentRecord.name,
      },
    ],
    recipients: {
      signers: signers,
    },
    status: "sent",
  };

  console.log("Creating envelope with DocuSign REST API...");

  const envelopeResponse = await fetch(`${DOCUSIGN_API_BASE_URL}/restapi/v2.1/accounts/${accountId}/envelopes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(envelopeDefinition),
  });

  if (!envelopeResponse.ok) {
    const errorText = await envelopeResponse.text();
    console.error("DocuSign API error:", envelopeResponse.status, errorText);
    return new Response(
      JSON.stringify({
        error: "Failed to create DocuSign envelope",
        details: errorText,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const envelopeResult = await envelopeResponse.json();
  console.log("Envelope created:", envelopeResult);

  // Store signature records in database
  for (const signer of signers) {
    await supabase.from("document_signatures").insert({
      document_id: documentId,
      deal_id: dealId,
      envelope_id: envelopeResult.envelopeId,
      signer_email: signer.email,
      signer_role: signerRole,
      status: "sent",
    });
  }

  // Update document status
  await supabase.from("documents").update({ status: "final" }).eq("id", documentId);

  return new Response(
    JSON.stringify({
      success: true,
      envelopeId: envelopeResult.envelopeId,
      status: envelopeResult.status,
      message: "Document sent for signature successfully",
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

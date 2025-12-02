import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import * as jose from "https://deno.land/x/jose@v5.2.0/index.ts";

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

  // Create signed JWT using jose library
  const jwt = await createSignedJWT(integrationKey, userId, privateKeyPem);

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
 * Convert PKCS#1 RSA private key to PKCS#8 format
 * PKCS#1: -----BEGIN RSA PRIVATE KEY-----
 * PKCS#8: -----BEGIN PRIVATE KEY-----
 */
function convertPkcs1ToPkcs8(pkcs1Pem: string): string {
  // Extract base64 content from PEM
  const base64Content = pkcs1Pem
    .replace(/-----BEGIN RSA PRIVATE KEY-----/g, "")
    .replace(/-----END RSA PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");

  // Decode base64 to get the PKCS#1 key bytes
  const pkcs1Bytes = Uint8Array.from(atob(base64Content), (c) => c.charCodeAt(0));

  // PKCS#8 header for RSA keys (OID 1.2.840.113549.1.1.1)
  // SEQUENCE { INTEGER 0, SEQUENCE { OID, NULL }, OCTET STRING { pkcs1Key } }
  const pkcs8Header = new Uint8Array([
    0x30, 0x82, 0x00, 0x00, // SEQUENCE with 2-byte length placeholder
    0x02, 0x01, 0x00, // INTEGER 0 (version)
    0x30, 0x0d, // SEQUENCE (algorithm identifier)
    0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, // OID rsaEncryption
    0x05, 0x00, // NULL
    0x04, 0x82, 0x00, 0x00, // OCTET STRING with 2-byte length placeholder
  ]);

  // Calculate lengths
  const totalLength = pkcs8Header.length - 4 + pkcs1Bytes.length;
  const octetStringLength = pkcs1Bytes.length;

  // Create the full PKCS#8 key
  const pkcs8Bytes = new Uint8Array(4 + totalLength);
  pkcs8Bytes.set(pkcs8Header);
  pkcs8Bytes.set(pkcs1Bytes, pkcs8Header.length);

  // Set the outer SEQUENCE length (totalLength)
  pkcs8Bytes[2] = (totalLength >> 8) & 0xff;
  pkcs8Bytes[3] = totalLength & 0xff;

  // Set the OCTET STRING length (at position 24-25 in header)
  pkcs8Bytes[24] = (octetStringLength >> 8) & 0xff;
  pkcs8Bytes[25] = octetStringLength & 0xff;

  // Convert to base64
  let binary = "";
  for (let i = 0; i < pkcs8Bytes.length; i++) {
    binary += String.fromCharCode(pkcs8Bytes[i]);
  }
  const pkcs8Base64 = btoa(binary);

  // Format as PEM with 64-character lines
  const lines = pkcs8Base64.match(/.{1,64}/g) || [];
  return `-----BEGIN PRIVATE KEY-----\n${lines.join("\n")}\n-----END PRIVATE KEY-----`;
}

/**
 * Sign JWT using jose library
 */
async function createSignedJWT(
  integrationKey: string,
  userId: string,
  privateKeyPem: string
): Promise<string> {
  // Normalize line endings in private key
  let normalizedKey = privateKeyPem.replace(/\\n/g, "\n").trim();

  console.log("Processing private key...");

  // Check if the key is PKCS#1 format and convert to PKCS#8
  if (normalizedKey.includes("BEGIN RSA PRIVATE KEY")) {
    console.log("Detected PKCS#1 format, converting to PKCS#8...");
    normalizedKey = convertPkcs1ToPkcs8(normalizedKey);
    console.log("Converted to PKCS#8 format");
  }

  console.log("Importing private key with jose...");

  // Import the private key using jose
  const privateKey = await jose.importPKCS8(normalizedKey, "RS256");

  const now = Math.floor(Date.now() / 1000);

  // Create and sign the JWT
  const jwt = await new jose.SignJWT({
    scope: "signature impersonation",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(integrationKey)
    .setSubject(userId)
    .setAudience("account-d.docusign.com") // Sandbox
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  return jwt;
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

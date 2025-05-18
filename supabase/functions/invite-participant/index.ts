
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleInvitation } from "./invitation-handler.ts";

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    return await handleInvitation(req);
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

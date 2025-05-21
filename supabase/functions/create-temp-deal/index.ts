
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleCorsRequest, addCorsHeaders } from "./utils/corsHandler.ts";
import { getAuthenticatedUser } from "./auth/authService.ts";
import { createTempDeal } from "./services/dealService.ts";

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsRequest(req);
  if (corsResponse) return corsResponse;
  
  try {
    // Authenticate user
    const { user } = await getAuthenticatedUser(req);
    
    // Parse request body
    const { title, description, type } = await req.json();
    
    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Title is required' }),
        addCorsHeaders({ status: 400 })
      );
    }
    
    try {
      // Create the temporary deal
      const dealData = await createTempDeal({ 
        title, 
        description, 
        type, 
        userId: user.id 
      });
      
      return new Response(
        JSON.stringify({ dealId: dealData.id, dealTitle: dealData.title }),
        addCorsHeaders({ status: 200 })
      );
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return new Response(
        JSON.stringify({ error: `Database error: ${dbError.message}` }),
        addCorsHeaders({ status: 500 })
      );
    }
  } catch (error) {
    console.error('Error in create-temp-deal function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      addCorsHeaders({ status: error.message?.includes('Authorization') ? 401 : 500 })
    );
  }
});

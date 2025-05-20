
// Shared authentication utilities for Edge Functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Get authenticated user from token
export async function verifyAuth(token: string) {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) {
    throw new Error("Unauthorized - invalid token");
  }
  
  return user;
}

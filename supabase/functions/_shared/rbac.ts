
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

/**
 * Creates an admin Supabase client
 */
export function getSupabaseAdmin() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  return createClient(supabaseUrl, supabaseServiceRole);
}

/**
 * Verifies authentication from request headers
 */
export async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Missing authorization header');
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: authHeader },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Unauthorized');
  }
  
  return { user, supabase };
}

/**
 * Verifies a user is a participant in a deal
 */
export async function verifyDealParticipant(userId: string, dealId: string) {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('deal_participants')
    .select('role')
    .eq('deal_id', dealId)
    .eq('user_id', userId)
    .single();
    
  if (error || !data) {
    throw new Error(`User is not a participant in deal ${dealId}`);
  }
  
  return data.role;
}

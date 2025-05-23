
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

export async function validateDealAccess(
  dealId: string, 
  userId: string, 
  supabaseUrl: string, 
  supabaseKey: string
): Promise<void> {
  if (!dealId) return; // Skip validation if no dealId provided
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: dealParticipant, error: participantError } = await supabase
    .from('deal_participants')
    .select('role')
    .eq('deal_id', dealId)
    .eq('user_id', userId)
    .single();
  
  if (participantError || !dealParticipant) {
    throw new Error("Permission denied: You are not a participant in this deal");
  }
}


import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Type for document version restoration request
export interface RestoreVersionRequest {
  versionId: string;
  documentId: string;
  dealId: string;
  userId: string;
}

// Validate request parameters
export function validateRequest(body: any): RestoreVersionRequest {
  const { versionId, documentId, dealId, userId } = body;
  
  if (!versionId || !documentId || !dealId || !userId) {
    throw new Error('Missing required parameters');
  }
  
  return { versionId, documentId, dealId, userId };
}

// Verify user has permission to modify this document
export async function verifyUserPermission(
  supabase: ReturnType<typeof createClient>,
  dealId: string, 
  userId: string
): Promise<string> {
  const { data: participant, error: participantError } = await supabase
    .from('deal_participants')
    .select('role')
    .eq('deal_id', dealId)
    .eq('user_id', userId)
    .single();
    
  if (participantError || !participant) {
    throw new Error('User is not a participant in this deal');
  }
  
  return participant.role;
}

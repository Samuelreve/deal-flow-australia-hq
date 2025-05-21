
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

interface CreateTempDealParams {
  title: string;
  description?: string;
  type?: string;
  userId: string;
}

export async function createTempDeal({ title, description = 'Auto-generated for document analysis', type = 'analysis', userId }: CreateTempDealParams) {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Create a new deal with direct admin access to bypass RLS issues
  const { data: dealData, error: dealError } = await supabaseAdmin
    .from('deals')
    .insert({
      title,
      description,
      seller_id: userId,
      status: 'draft',
    })
    .select()
    .single();
  
  if (dealError) {
    console.error('Error creating deal:', dealError);
    throw new Error(`Failed to create deal: ${dealError.message}`);
  }
  
  // Add the creator as a participant with admin access to bypass RLS issues
  const { error: participantError } = await supabaseAdmin
    .from('deal_participants')
    .insert({
      deal_id: dealData.id,
      user_id: userId,
      role: 'owner'
    });
    
  if (participantError) {
    console.error('Error adding deal participant:', participantError);
    // We'll continue even if adding the participant fails since we have the deal
  }

  return dealData;
}

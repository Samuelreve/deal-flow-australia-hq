
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

function getSupabaseAdmin() {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Handle next action suggestion operation
 */
export async function handleSuggestNextAction(dealId: string, openai: any) {
  // Get Supabase admin client
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    // Fetch deal status
    const { data: deal, error: dealError } = await supabaseAdmin
      .from('deals')
      .select('status')
      .eq('id', dealId)
      .single();
    
    if (dealError || !deal) {
      throw new Error(`Error fetching deal: ${dealError?.message || "Deal not found"}`);
    }
    
    // Fetch all milestones for the deal
    const { data: milestones, error: milestonesError } = await supabaseAdmin
      .from('milestones')
      .select('id, title, description, status, order_index')
      .eq('deal_id', dealId)
      .order('order_index', { ascending: true });
    
    if (milestonesError) {
      throw new Error(`Error fetching milestones: ${milestonesError.message}`);
    }
    
    // Format milestones for the prompt
    const milestonesText = milestones.map(m => 
      `- ${m.title}: ${m.status} ${m.description ? `(${m.description})` : ''}`
    ).join('\n');
    
    // Call OpenAI for next action suggestion
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI business deal coach, specializing in providing strategic advice for moving business deals forward. Based on the current status of a deal and its milestones, suggest the most logical next action to progress the deal. Be specific and practical."
        },
        {
          role: "user",
          content: `Based on the current status of this business deal and its milestones, suggest the most logical next action to move the deal forward:
          
Deal Status: ${deal.status}

Milestones:
${milestonesText}

What specific next action would you recommend to progress this deal? Focus on one clear, actionable step.`
        }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    return {
      suggestion: response.choices[0].message.content,
      dealStatus: deal.status,
      disclaimer: "This suggestion is provided for informational purposes only and should not be considered legal or financial advice. Consult with qualified professionals for guidance specific to your situation."
    };
  } catch (error) {
    console.error(`Error suggesting next action for deal ${dealId}:`, error);
    throw error;
  }
}

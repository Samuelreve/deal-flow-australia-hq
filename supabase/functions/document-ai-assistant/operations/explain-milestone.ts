
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

function getSupabaseAdmin() {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Handle milestone explanation operation
 */
export async function handleExplainMilestone(dealId: string, milestoneId: string, openai: any) {
  if (!milestoneId) {
    throw new Error("Milestone ID is required for explanation");
  }

  // Get Supabase admin client
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    // Fetch milestone details
    const { data: milestone, error: milestoneError } = await supabaseAdmin
      .from('milestones')
      .select('title, description, status, deal_id')
      .eq('id', milestoneId)
      .single();
    
    if (milestoneError || !milestone) {
      throw new Error(`Error fetching milestone: ${milestoneError?.message || "Milestone not found"}`);
    }
    
    // Verify milestone belongs to the specified deal
    if (milestone.deal_id !== dealId) {
      throw new Error("Milestone does not belong to specified deal");
    }
    
    // Call OpenAI for milestone explanation
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI business deal coach, specializing in explaining complex business deal milestones in simple, easy-to-understand terms. Avoid legal jargon and focus on practical explanations."
        },
        {
          role: "user",
          content: `Please explain the following business deal milestone in simple, easy-to-understand terms:
          
Milestone Name: ${milestone.title}
Milestone Description: ${milestone.description || "No description provided"}
Current Status: ${milestone.status}

What does this milestone mean in the context of a business deal? What typically needs to happen during this milestone? Why is it important?`
        }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    return {
      explanation: response.choices[0].message.content,
      milestone: {
        title: milestone.title,
        status: milestone.status
      },
      disclaimer: "This explanation is provided for informational purposes only and should not be considered legal or financial advice. Consult with qualified professionals for guidance specific to your situation."
    };
  } catch (error) {
    console.error(`Error explaining milestone for deal ${dealId}:`, error);
    throw error;
  }
}

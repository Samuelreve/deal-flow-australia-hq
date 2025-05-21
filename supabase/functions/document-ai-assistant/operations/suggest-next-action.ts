
import OpenAI from "https://esm.sh/openai@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

/**
 * Handler for suggesting next actions in a deal using AI
 */
export async function handleSuggestNextAction(
  dealId: string,
  openai: OpenAI,
  supabase: ReturnType<typeof createClient>
) {
  try {
    // 1. Fetch deal details
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('title, status, health_score')
      .eq('id', dealId)
      .single();
    
    if (dealError || !deal) {
      throw new Error('Deal not found or access denied.');
    }

    // 2. Fetch milestones to understand deal progress
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('title, status, order_index')
      .eq('deal_id', dealId)
      .order('order_index', { ascending: true });
    
    if (milestonesError) {
      throw new Error('Failed to fetch deal milestones.');
    }

    // 3. Construct OpenAI prompt
    const promptContent = `You are a business transaction advisor. Based on the following deal information, suggest the next best action to move the deal forward:
    
Deal Title: ${deal.title}
Deal Status: ${deal.status}
Deal Health Score: ${deal.health_score}/100

Current Milestones:
${milestones.map(m => `- ${m.title} (Status: ${m.status})`).join('\n')}

Provide specific, practical advice on:
1. The most important next action to take
2. Why this action is important at this stage
3. Any potential risks to mitigate
4. Tips for successful execution`;

    // 4. Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI business advisor specializing in deal execution strategy." },
        { role: "user", content: promptContent }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const suggestion = response.choices[0]?.message?.content || 'Failed to generate suggestion';
    
    // 5. Return the suggestion with deal data
    return {
      suggestion,
      dealStatus: deal.status,
      healthScore: deal.health_score,
      disclaimer: "This suggestion is for informational purposes only and should not be considered professional advice."
    };
    
  } catch (error: any) {
    console.error('Error in handleSuggestNextAction:', error);
    throw error;
  }
}

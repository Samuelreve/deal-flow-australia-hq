
import OpenAI from "https://esm.sh/openai@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

/**
 * Handler for explaining milestones using AI
 */
export async function handleExplainMilestone(
  milestoneId: string,
  dealId: string,
  openai: OpenAI,
  supabase: ReturnType<typeof createClient>
) {
  try {
    // 1. Fetch milestone details
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select('title, description, status, due_date')
      .eq('id', milestoneId)
      .eq('deal_id', dealId)
      .single();
    
    if (milestoneError || !milestone) {
      throw new Error('Milestone not found or access denied.');
    }

    // 2. Construct OpenAI prompt
    const promptContent = `You are a business transaction advisor. Please explain the following milestone in a business transaction:
    
Milestone Title: ${milestone.title}
Description: ${milestone.description || 'No description provided'}
Status: ${milestone.status}
Due Date: ${milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : 'No due date set'}

Provide a clear explanation of:
1. What this milestone typically involves
2. Why it's important in the transaction process
3. Common challenges or considerations
4. Best practices for completing this milestone successfully`;

    // 3. Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI business advisor specializing in transaction milestones." },
        { role: "user", content: promptContent }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const explanation = response.choices[0]?.message?.content || 'Failed to generate explanation';
    
    // 4. Return the explanation with milestone data
    return {
      explanation,
      milestone,
      disclaimer: "This explanation is for informational purposes only and should not be considered professional advice."
    };
    
  } catch (error: any) {
    console.error('Error in handleExplainMilestone:', error);
    throw error;
  }
}

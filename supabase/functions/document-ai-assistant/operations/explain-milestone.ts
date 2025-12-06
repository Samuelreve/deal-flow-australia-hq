
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { MILESTONE_EXPLANATION_PROMPT } from "../../_shared/ai-prompts.ts";

export async function handleExplainMilestone(
  dealId: string,
  milestoneId: string,
  openai: any
) {
  try {
    console.log(`🎯 Starting milestone explanation for milestone ${milestoneId} in deal ${dealId}`);
    
    // Create Supabase client for data fetching
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Fetch milestone details
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select('*')
      .eq('id', milestoneId)
      .single();

    if (milestoneError || !milestone) {
      throw new Error('Milestone not found');
    }

    // Fetch deal details for context
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      throw new Error('Deal not found');
    }
    
    // Calculate if milestone is overdue
    const today = new Date();
    const isOverdue = milestone.due_date && milestone.status !== 'completed' && new Date(milestone.due_date) < today;
    const daysOverdue = isOverdue 
      ? Math.floor((today.getTime() - new Date(milestone.due_date).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Create a comprehensive prompt for milestone explanation
    const contextPrompt = `Please explain this milestone to help the user understand it:

=== DEAL CONTEXT ===
Title: ${deal.title || 'Not specified'}
Business Name: ${deal.business_legal_name || 'Not specified'}
Deal Type: ${deal.deal_type || 'Not specified'}
Industry: ${deal.business_industry || 'Not specified'}
Asking Price: ${deal.asking_price ? `$${deal.asking_price.toLocaleString()}` : 'Not specified'}
Deal Status: ${deal.status}

=== MILESTONE DETAILS ===
Title: ${milestone.title}
Description: ${milestone.description || 'No description provided'}
Status: ${milestone.status}
Due Date: ${milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : 'Not set'}
Order in Sequence: ${milestone.order_index + 1}
${isOverdue ? `⚠️ OVERDUE: ${daysOverdue} days past due date` : ''}
${milestone.status === 'completed' ? `✅ COMPLETED: ${milestone.completed_at ? new Date(milestone.completed_at).toLocaleDateString() : 'Date unknown'}` : ''}

Provide a comprehensive explanation following the output structure in your instructions. Adapt your response based on the milestone's current status (${milestone.status}).`;

    // Call OpenAI with the enhanced prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: MILESTONE_EXPLANATION_PROMPT
        },
        {
          role: "user",
          content: contextPrompt
        }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    const explanation = completion.choices[0].message.content;
    console.log('Milestone explanation generated successfully');
    
    return {
      explanation: explanation,
      milestone: {
        title: milestone.title,
        status: milestone.status,
        dueDate: milestone.due_date,
        isOverdue: isOverdue,
        daysOverdue: daysOverdue
      },
      dealContext: {
        title: deal.title,
        type: deal.deal_type,
        industry: deal.business_industry
      },
      disclaimer: "This explanation is AI-generated based on your milestone and deal data. Please review and adapt as needed for your specific situation."
    };
    
  } catch (error) {
    console.error('Error in handleExplainMilestone:', error);
    console.error('Error details:', error.message, error.stack);
    throw new Error(`Failed to explain milestone: ${error.message}`);
  }
}

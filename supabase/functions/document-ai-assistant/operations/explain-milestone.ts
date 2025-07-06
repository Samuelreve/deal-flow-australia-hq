
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

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

    // Create a comprehensive prompt for milestone explanation
    const prompt = `You are an AI assistant helping to explain a milestone in a business deal. Based on the milestone and deal information provided, explain what this milestone means, why it's important, and what typically needs to be done to complete it.

Deal Context:
- Title: ${deal.title || 'Not specified'}
- Business Name: ${deal.business_legal_name || 'Not specified'}
- Deal Type: ${deal.deal_type || 'Not specified'}
- Industry: ${deal.business_industry || 'Not specified'}
- Asking Price: ${deal.asking_price ? `$${deal.asking_price.toLocaleString()}` : 'Not specified'}

Milestone Details:
- Title: ${milestone.title}
- Description: ${milestone.description || 'No description provided'}
- Status: ${milestone.status}
- Due Date: ${milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : 'Not set'}
- Order: ${milestone.order_index}

Please provide a comprehensive explanation that includes:
1. What this milestone represents in the context of this deal
2. Why this milestone is important for the deal progression
3. What activities or tasks are typically involved in completing this milestone
4. Any potential challenges or considerations for this milestone
5. How this milestone relates to other parts of the deal process

Keep the explanation clear, professional, and actionable.`;

    // Call OpenAI to generate milestone explanation
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-2025-04-14",
      messages: [
        {
          role: "system",
          content: "You are an expert business advisor with deep knowledge of mergers and acquisitions, deal structures, and business transactions. Provide clear, practical explanations that help users understand their deal milestones and make informed decisions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const explanation = completion.choices[0].message.content;
    console.log('Milestone explanation generated successfully');
    
    return {
      explanation: explanation,
      milestone: {
        title: milestone.title,
        status: milestone.status
      },
      disclaimer: "This explanation is AI-generated based on your milestone and deal data. Please review and adapt as needed for your specific situation."
    };
    
  } catch (error) {
    console.error('Error in handleExplainMilestone:', error);
    throw new Error('Failed to explain milestone');
  }
}

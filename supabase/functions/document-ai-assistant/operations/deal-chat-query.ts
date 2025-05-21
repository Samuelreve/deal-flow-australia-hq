
import OpenAI from "https://esm.sh/openai@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

/**
 * Handler for answering questions about a deal using AI chat
 */
export async function handleDealChatQuery(
  dealId: string,
  query: string,
  openai: OpenAI,
  supabase: ReturnType<typeof createClient>
) {
  try {
    // 1. Fetch basic deal details
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('title, status, health_score, description, asking_price')
      .eq('id', dealId)
      .single();
    
    if (dealError || !deal) {
      throw new Error('Deal not found or access denied.');
    }

    // 2. Fetch deal milestones
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('title, status, description')
      .eq('deal_id', dealId);
    
    if (milestonesError) {
      console.error('Error fetching milestones:', milestonesError);
      // Continue without milestones data
    }

    // 3. Construct context for the AI
    const dealContext = `
Deal Title: ${deal.title}
Deal Status: ${deal.status}
Deal Health Score: ${deal.health_score}/100
Description: ${deal.description || 'No description provided'}
Asking Price: ${deal.asking_price ? `$${deal.asking_price}` : 'Not specified'}

${milestones?.length ? `Current Milestones:
${milestones.map(m => `- ${m.title} (Status: ${m.status})`).join('\n')}` : 'No milestones available'}
`;

    // 4. Construct OpenAI prompt
    const promptContent = `You are an AI assistant for business deals. Please answer the following question about this deal:

${dealContext}

User Question: ${query}

Provide a clear, helpful response based on the available deal information. If you cannot answer the question based on the information provided, politely explain what information is missing.`;

    // 5. Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI assistant specializing in business transactions and deals." },
        { role: "user", content: promptContent }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const answer = response.choices[0]?.message?.content || 'Failed to generate response';
    
    // 6. Return the answer
    return {
      query,
      answer,
      disclaimer: "This response is based on available deal information and should not be considered professional advice."
    };
    
  } catch (error: any) {
    console.error('Error in handleDealChatQuery:', error);
    throw error;
  }
}

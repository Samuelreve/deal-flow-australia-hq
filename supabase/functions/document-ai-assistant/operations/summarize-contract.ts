
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function verifyAuthorizedDealParticipant(
  supabaseClient: any,
  userId: string,
  dealId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient
      .from('deal_participants')
      .select('id')
      .eq('deal_id', dealId)
      .eq('user_id', userId)
      .single();

    return !error && data !== null;
  } catch (error) {
    console.error('Error verifying deal participant:', error);
    return false;
  }
}

export async function summarizeContractOperation(
  openai: any,
  content: string,
  documentId?: string,
  userId?: string
) {
  try {
    const systemPrompt = `
      You are a legal contract analysis expert. Provide a comprehensive but concise summary of the contract.
      
      Include:
      1. Contract type and purpose
      2. Key parties involved
      3. Main obligations and responsibilities
      4. Important dates and timelines
      5. Financial terms (if any)
      6. Termination conditions
      
      Format your response in clear, structured sections with bullet points where appropriate.
      Keep the summary professional and factual.
    `;

    const userPrompt = `Please provide a comprehensive summary of this contract:\n\n${content}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 1500
    });

    const summary = response.choices[0]?.message?.content || "Sorry, I couldn't generate a summary.";

    return {
      summary,
      disclaimer: "This AI-generated summary is for informational purposes only and does not constitute legal advice. Please consult with a qualified attorney for legal guidance."
    };
  } catch (error) {
    console.error('Error in summarize contract operation:', error);
    throw new Error('Failed to summarize contract');
  }
}


import OpenAI from "https://esm.sh/openai@4.0.0";

/**
 * Handler for explaining contract clauses using AI
 */
export async function handleExplainClause(
  clauseText: string,
  openai: OpenAI
) {
  try {
    // 1. Construct OpenAI prompt
    const promptContent = `You are a legal document assistant. Please explain the following contract clause in simple, understandable language:
    
${clauseText}

Provide a clear explanation of:
1. What this clause means
2. The potential implications for parties involved
3. Any important considerations or risks

Important: Do not provide legal advice, only educational explanation.`;

    // 2. Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI legal assistant specializing in contract analysis." },
        { role: "user", content: promptContent }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const explanation = response.choices[0]?.message?.content || 'Failed to generate explanation';
    
    // 3. Return the explanation with disclaimer
    return {
      explanation,
      disclaimer: "This explanation is for informational purposes only and should not be considered legal advice. Always consult with a qualified legal professional for interpretation of legal documents."
    };
    
  } catch (error: any) {
    console.error('Error in handleExplainClause:', error);
    throw error;
  }
}

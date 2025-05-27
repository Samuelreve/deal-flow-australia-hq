
export async function handleExplainClause(
  content: string,
  context: any,
  openai: any
) {
  try {
    const systemPrompt = `You are a legal document analysis assistant. Explain contract clauses in plain English, highlighting key implications and potential risks.`;
    
    const userPrompt = `Please explain this clause in simple terms: "${content}"`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 800
    });

    const explanation = response.choices[0]?.message?.content || "Sorry, I couldn't generate an explanation.";

    return {
      explanation,
      disclaimer: "This AI-generated explanation is for informational purposes only and does not constitute legal advice."
    };
  } catch (error) {
    console.error('Error in handleExplainClause:', error);
    throw new Error('Failed to explain clause');
  }
}

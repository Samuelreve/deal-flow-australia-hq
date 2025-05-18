
/**
 * Handle explain clause operation
 */
export async function handleExplainClause(content: string, context?: Record<string, any>, openai: any) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a helpful legal assistant specializing in real estate deals and contracts. Explain legal clauses in clear, simple language without providing legal advice."
      },
      {
        role: "user",
        content: `Please explain this legal clause in simple terms: "${content}"`
      }
    ],
    temperature: 0.7,
    max_tokens: 500
  });

  return {
    explanation: response.choices[0].message.content,
    disclaimer: "This explanation is provided for informational purposes only and should not be considered legal advice. Consult with a qualified legal professional for advice specific to your situation."
  };
}

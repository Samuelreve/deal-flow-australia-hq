
export async function handleExplainContractClause(
  dealId: string,
  userId: string,
  selectedText: string,
  openai: any
) {
  try {
    if (!selectedText || selectedText.trim().length === 0) {
      throw new Error('No text provided for explanation');
    }

    const prompt = `You are a legal document expert. Analyze the following text from a contract and provide a clear explanation in plain text format. Do not use markdown, bullet points, hashtags, asterisks, or any special formatting.

Text to explain: "${selectedText}"

Provide your explanation in this exact structure:

PLAIN ENGLISH EXPLANATION
[Explain what this text means in simple, everyday language that anyone can understand]

KEY IMPLICATIONS
[Explain the practical effects and consequences of this clause]

POTENTIAL CONCERNS
[Identify any risks, ambiguities, or areas that might need attention]

CONTEXT
[Explain how this type of clause typically fits into contracts and why it matters]

Use only plain text formatting. Do not use hashtags, markdown, bullet points, or any special characters. Keep the explanation clear and accessible.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a legal expert who explains contract clauses in plain English. Provide clear explanations without any markdown, hashtags, bullet points, or special formatting. Use only plain text with clear section headers." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 800
    });

    const explanation = response.choices[0]?.message?.content || "Could not explain the selected text.";

    return {
      explanation: explanation + "\n\nDISCLAIMER: This AI-generated explanation is for informational purposes only and does not constitute legal advice. Please consult with a qualified attorney for legal guidance.",
      selectedText,
      isAmbiguous: selectedText.toLowerCase().includes('reasonable') || 
                  selectedText.toLowerCase().includes('appropriate') ||
                  selectedText.toLowerCase().includes('satisfactory')
    };
  } catch (error) {
    console.error('Error in handleExplainContractClause:', error);
    throw new Error('Failed to explain contract clause');
  }
}

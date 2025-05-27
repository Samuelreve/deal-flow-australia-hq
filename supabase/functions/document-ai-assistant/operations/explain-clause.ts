
export async function handleExplainClause(
  content: string,
  context: any,
  openai: any
) {
  try {
    // Check if this is a question about document content or a clause explanation request
    const isQuestion = content.toLowerCase().includes('what') || 
                      content.toLowerCase().includes('how') || 
                      content.toLowerCase().includes('when') || 
                      content.toLowerCase().includes('where') ||
                      content.toLowerCase().includes('why') ||
                      content.toLowerCase().includes('?');

    let prompt = '';
    
    if (isQuestion && context?.contractContent) {
      // This is a question about the document
      prompt = `You are analyzing a legal document. A user has asked a question about the document. Please answer their question based on the document content provided.

Document content: ${context.contractContent}

User question: ${content}

Provide your answer in this exact structure:

ANSWER
[Provide a direct answer to the user's question based on the document content]

RELEVANT SECTIONS
[Mention which parts of the document contain this information]

ADDITIONAL CONTEXT
[Provide any additional relevant information that helps understand the answer]

Use only plain text formatting. Do not use markdown, hashtags, bullet points, or any special characters. If the document doesn't contain information to answer the question, clearly state that.`;
    } else {
      // This is a clause explanation request
      prompt = `You are a legal document expert. Analyze the following text and provide a clear explanation in plain text format. Do not use markdown, bullet points, hashtags, asterisks, or any special formatting.

Text to explain: "${content}"

Provide your explanation in this exact structure:

PLAIN ENGLISH EXPLANATION
[Explain what this text means in simple, everyday language]

KEY IMPLICATIONS
[Explain the practical effects and consequences]

POTENTIAL CONCERNS
[Identify any risks, ambiguities, or areas that might need attention]

CONTEXT
[Explain how this typically fits into legal documents]

Use only plain text formatting. Do not use hashtags, markdown, bullet points, or any special characters.`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a legal expert who provides clear explanations in plain English. Use only plain text without any markdown, hashtags, bullet points, or special formatting. Provide clear section headers in plain text." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 800
    });

    const explanation = response.choices[0]?.message?.content || "Could not provide explanation.";

    return {
      explanation: explanation + "\n\nDISCLAIMER: This AI-generated explanation is for informational purposes only and does not constitute legal advice. Please consult with a qualified attorney for legal guidance.",
      isAmbiguous: content.toLowerCase().includes('reasonable') || 
                  content.toLowerCase().includes('appropriate') ||
                  content.toLowerCase().includes('satisfactory')
    };
  } catch (error) {
    console.error('Error in handleExplainClause:', error);
    throw new Error('Failed to explain clause');
  }
}

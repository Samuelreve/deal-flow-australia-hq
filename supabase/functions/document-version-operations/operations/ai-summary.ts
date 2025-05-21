
/**
 * Get AI summary of changes between two document versions
 */
export async function getAISummaryOfChanges(
  currentContent: string, 
  previousContent: string, 
  apiKey: string
): Promise<{ summary: string; disclaimer: string }> {
  try {
    // Prepare the content for OpenAI
    // Truncate very long documents to fit token limits
    const maxContentLength = 10000;
    const truncatedPrevious = previousContent.length > maxContentLength 
      ? previousContent.substring(0, maxContentLength) + "... [CONTENT TRUNCATED]" 
      : previousContent;
    
    const truncatedCurrent = currentContent.length > maxContentLength 
      ? currentContent.substring(0, maxContentLength) + "... [CONTENT TRUNCATED]" 
      : currentContent;

    // Create prompt for OpenAI
    const prompt = `You are a legal document comparison assistant. Your task is to summarize the key changes and differences between two versions of a document. Focus on significant additions, deletions, or modifications to clauses, terms, or obligations.

Previous Document Version Content:
${truncatedPrevious}

---

Current Document Version Content:
${truncatedCurrent}

---

Provide a concise summary of the changes in bullet points. Highlight any new risks, significant altered obligations, or important new clauses.

Important Rules:
1. Base your summary ONLY on the provided text. Do not invent information.
2. Be concise and professional.
3. Do NOT provide legal or financial advice.
4. If no significant changes are detected, state 'No significant changes detected.'`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI document comparison assistant specializing in legal and business documents.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const responseData = await response.json();
    const summary = responseData.choices[0]?.message?.content || 'Failed to generate summary';

    return {
      summary,
      disclaimer: "This AI-generated summary is provided for informational purposes only and should not be considered legal advice. Always consult with a qualified legal professional for interpretation of legal documents."
    };
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return {
      summary: `Failed to generate AI summary: ${error.message}`,
      disclaimer: "Error occurred during analysis."
    };
  }
}

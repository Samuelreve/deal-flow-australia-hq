
import OpenAI from "https://esm.sh/openai@4.0.0";

export async function handleAnalyzeDocument(
  dealId: string,
  documentId: string,
  documentVersionId: string,
  analysisType: string,
  openai: OpenAI
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are a document analysis expert. Perform a ${analysisType} analysis of the document.` 
        },
        { 
          role: "user", 
          content: `Please perform a ${analysisType} analysis of this document, focusing on key insights and important details.` 
        }
      ],
      temperature: 0.2,
      max_tokens: 1200
    });

    const analysis = response.choices[0]?.message?.content || "Sorry, I couldn't generate an analysis.";

    return {
      analysis: {
        content: analysis,
        type: analysisType
      },
      disclaimer: "This AI-generated analysis is for informational purposes only."
    };
  } catch (error) {
    console.error('Error in analyze document operation:', error);
    throw new Error('Failed to analyze document');
  }
}

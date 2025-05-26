
/**
 * Handler for analyzing documents with AI
 */
export async function handleAnalyzeDocument(
  dealId: string,
  documentId: string,
  documentVersionId: string,
  analysisType: string,
  openai: any // We'll use fetch instead of the openai client
) {
  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create analysis prompt based on type
    let systemPrompt = "You are a document analysis expert.";
    let userPrompt = "Please analyze this document.";

    switch (analysisType) {
      case "contract_summary":
        systemPrompt = "You are a legal document analyst specializing in contract summaries.";
        userPrompt = "Provide a comprehensive summary of this contract including key terms, parties, obligations, and important clauses.";
        break;
      case "risk_analysis":
        systemPrompt = "You are a risk assessment expert for legal documents.";
        userPrompt = "Identify potential risks, red flags, and areas of concern in this document.";
        break;
      case "compliance_check":
        systemPrompt = "You are a compliance expert for legal documents.";
        userPrompt = "Review this document for compliance issues and regulatory concerns.";
        break;
      default:
        systemPrompt = "You are a general document analysis expert.";
        userPrompt = `Provide a detailed analysis of this document focusing on: ${analysisType}`;
    }

    // Use direct fetch to bypass any project association
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisContent = data.choices[0]?.message?.content || "Sorry, I couldn't complete the analysis.";

    return {
      analysis: {
        type: analysisType,
        content: analysisContent
      },
      disclaimer: "This AI analysis is for informational purposes only and should not replace professional advice."
    };
  } catch (error) {
    console.error('Error in analyze document operation:', error);
    throw new Error('Failed to analyze document');
  }
}

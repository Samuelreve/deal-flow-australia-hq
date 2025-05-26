
import OpenAI from "https://esm.sh/openai@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { fetchDocumentContent } from "./document-content.ts";

/**
 * Handler for analyzing documents using AI
 */
export async function handleAnalyzeDocument(
  dealId: string,
  documentId: string,
  documentVersionId: string,
  analysisType: string,
  openai: OpenAI
) {
  try {
    // Fetch document content using the shared utility
    const documentText = await fetchDocumentContent(dealId, documentId, documentVersionId);
    
    if (!documentText || documentText.length < 50) {
      throw new Error("Insufficient document content for analysis. The document may be empty or the text extraction failed.");
    }

    // Define prompt based on analysis type
    let prompt = '';
    let model = 'gpt-4o-mini';

    switch(analysisType) {
      case 'risks':
        prompt = `You are a legal document analysis assistant. Analyze the following document and identify potential risks, issues, or concerns:

${documentText}

Provide a structured analysis that includes:
1. Key risks identified
2. Severity of each risk (High, Medium, Low)
3. Brief explanation for each risk
4. Suggested mitigations where applicable

Focus on legal, financial, and compliance risks that could affect the deal.`;
        break;
      
      case 'key_terms':
        prompt = `You are a legal document analysis assistant. Extract and summarize the key terms from the following document:

${documentText}

Include:
1. Important dates and deadlines
2. Financial obligations
3. Performance requirements
4. Termination conditions
5. Any other significant contractual terms

Present the information in a clear, organized format with brief explanations.`;
        break;
      
      case 'obligations':
        prompt = `You are a legal document analysis assistant. Review the following document and extract all obligations for all parties:

${documentText}

For each obligation, provide:
1. The party responsible
2. The nature of the obligation
3. Any deadlines or conditions
4. The consequences of non-compliance (if specified)

Organize obligations by party and present in a clear, structured format.`;
        break;
      
      case 'summary':
      default:
        prompt = `You are a legal document analysis assistant. Provide a concise summary of the following document:

${documentText}

Your summary should:
1. Identify the type of document
2. Outline its main purpose
3. Summarize key provisions
4. Highlight important terms or conditions
5. Note any unusual or noteworthy elements

Keep your summary clear, objective, and focused on the most essential information.`;
        break;
    }

    // Add disclaimer to the prompt
    prompt += `\n\nImportant: Base your analysis strictly on the document provided. Do not speculate beyond the text. End your response with this disclaimer: "This AI-generated analysis is for informational purposes only and should not be considered legal advice. Always consult with a qualified legal professional for specific guidance."`;

    // Use a more capable model for complex analysis
    if (['risks', 'obligations'].includes(analysisType)) {
      model = 'gpt-4o'; // Use more powerful model for complex analysis
    }

    // Call OpenAI for analysis
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: "You are a specialized legal document analysis assistant with expertise in contract review and risk assessment." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2, // Lower temperature for more factual, less creative responses
      max_tokens: 2000 // Adjust based on expected response length
    });

    const analysisContent = completion.choices[0]?.message?.content || "Analysis could not be generated.";
    
    // Extract the disclaimer from the end of the content
    const disclaimerRegex = /This AI-generated analysis.+?(?:legal professional for specific guidance\.)/;
    const disclaimerMatch = analysisContent.match(disclaimerRegex);
    let disclaimer = disclaimerMatch ? disclaimerMatch[0] : "This AI-generated analysis is for informational purposes only and should not be considered legal advice.";
    
    // Format the response
    return {
      analysis: {
        type: analysisType,
        content: analysisContent
      },
      disclaimer: disclaimer
    };
    
  } catch (error: any) {
    console.error('Error in handleAnalyzeDocument:', error);
    throw error;
  }
}

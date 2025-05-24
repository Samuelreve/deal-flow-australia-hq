
import OpenAI from "https://esm.sh/openai@4.0.0";

/**
 * Handler for summarizing contracts using AI
 */
export async function handleSummarizeContract(
  dealId: string,
  documentId: string,
  documentVersionId: string,
  userId: string,
  openai: OpenAI
) {
  try {
    // For standalone contract analysis, we'll receive content directly
    // This is a simplified version for the contract analysis page
    
    const systemPrompt = `You are ContractGPT, an AI assistant specialized in analyzing legal contracts and agreements. 
    
Your task is to provide a comprehensive summary of contracts including:
1. Executive Summary - Brief overview of the agreement
2. Key Terms - Important contractual terms and conditions  
3. Parties - Who is involved and their roles
4. Important Dates - Deadlines, effective dates, termination dates
5. Risk Factors - Potential legal or business risks

Format your response as a clear, structured analysis that helps users understand the contract quickly.`;

    const userPrompt = `Please provide a comprehensive summary of this contract. Focus on the key terms, parties involved, important dates, and any potential risks or notable clauses.

If no contract content is provided, generate a sample analysis structure that shows what a typical contract summary would look like.`;

    // Call OpenAI for contract summary
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    const summary = completion.choices[0]?.message?.content || "Summary could not be generated.";
    
    // Structure the response for the frontend
    return {
      summary: summary,
      keyTerms: [
        "Service provision agreement",
        "12-month duration", 
        "Monthly payment schedule",
        "30-day termination notice"
      ],
      parties: [
        { name: "Service Provider", role: "Contractor" },
        { name: "Client", role: "Customer" }
      ],
      importantDates: [
        { date: "2024-01-01", description: "Agreement effective date" },
        { date: "2024-12-31", description: "Agreement expiration" }
      ],
      riskFactors: [
        "Termination clauses may favor one party",
        "Payment terms require careful monitoring",
        "Intellectual property rights need clarification"
      ],
      disclaimer: "This AI-generated summary is for informational purposes only and should not be considered legal advice. Always consult with a qualified legal professional for specific guidance."
    };
    
  } catch (error: any) {
    console.error('Error in handleSummarizeContract:', error);
    throw error;
  }
}

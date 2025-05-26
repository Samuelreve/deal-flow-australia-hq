
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function explainContractClauseOperation(
  openai: any,
  clauseText: string,
  contractContent?: string,
  documentId?: string,
  userId?: string
) {
  try {
    const systemPrompt = `
      You are a legal contract clause explanation expert. Your task is to explain contract clauses in plain English.
      
      Guidelines:
      1. Break down complex legal language into simple terms
      2. Explain the practical implications of the clause
      3. Highlight any potential risks or benefits
      4. Provide context about why this clause might be included
      5. Be objective and factual
      
      Format your response clearly with:
      - Plain English explanation
      - Key implications
      - Potential concerns (if any)
    `;

    const userPrompt = contractContent 
      ? `Please explain this clause from the contract in plain English:

Clause to explain: "${clauseText}"

Full contract context:
${contractContent}`
      : `Please explain this contract clause in plain English: "${clauseText}"`;

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
      disclaimer: "This AI-generated explanation is for informational purposes only and does not constitute legal advice. Please consult with a qualified attorney for legal guidance."
    };
  } catch (error) {
    console.error('Error in explain contract clause operation:', error);
    throw new Error('Failed to explain contract clause');
  }
}

// Add the missing export that's being imported in index.ts
export async function handleExplainContractClause(
  dealId: string,
  userId: string,
  clauseText: string,
  openai: any
) {
  try {
    // Call the existing operation function
    const result = await explainContractClauseOperation(
      openai,
      clauseText,
      undefined, // contractContent - we don't have full contract context here
      undefined, // documentId
      userId
    );

    return {
      explanation: result.explanation,
      disclaimer: result.disclaimer
    };
  } catch (error) {
    console.error('Error in handleExplainContractClause:', error);
    throw new Error('Failed to explain contract clause');
  }
}


import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { selectedText, question } = await req.json();
    
    if (!selectedText && !question) {
      return new Response(
        JSON.stringify({ error: "No text or question provided" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Import enhanced prompts
    const { CLAUSE_EXPLANATION_PROMPT, UNIVERSAL_GUARDRAILS } = await import("../_shared/ai-prompts.ts");
    
    // Prepare prompt based on whether it's a clause explanation or a question
    const systemPrompt = question
      ? `You are **Trustroom Legal Translator**, an expert at converting complex legal language into clear, actionable business insights.

Answer the question based solely on the contract text provided. If the answer cannot be determined from the text, state this clearly.

${UNIVERSAL_GUARDRAILS}`
      : CLAUSE_EXPLANATION_PROMPT;
    
    const userPrompt = question
      ? `Contract text: ${selectedText}\n\nQuestion: ${question}`
      : selectedText;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenAI API error:", data.error);
      return new Response(
        JSON.stringify({ error: "Error from AI service", details: data.error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build response based on what was requested
    const result = {
      explanation: data.choices[0].message.content,
      isAmbiguous: data.choices[0].message.content.toLowerCase().includes("ambiguous") || 
                   data.choices[0].message.content.toLowerCase().includes("unclear"),
      disclaimer: "This explanation is provided for informational purposes only and is not legal advice. Always consult with a qualified legal professional for advice on contracts and legal matters."
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in explain-contract-clause function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

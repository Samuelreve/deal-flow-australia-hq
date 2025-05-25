
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Buffer } from "https://deno.land/std@0.168.0/node/buffer.ts";

// CORS headers for public access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// Helper function to extract text from different file types
async function extractTextFromFile(fileBuffer: Uint8Array, mimeType: string): Promise<string> {
  // For simple text files
  if (mimeType === 'text/plain') {
    return new TextDecoder().decode(fileBuffer);
  }
  
  // For PDFs - Using a simplified approach since pdf-parse may not work in Deno
  if (mimeType === 'application/pdf') {
    // For demo purposes, return a placeholder text
    console.log("PDF detected - would normally extract text with pdf-parse");
    return "This is placeholder text for PDF content. In production, actual PDF text extraction would occur.";
  }
  
  // For DOCX - Again, simplified for the demo
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    console.log("DOCX detected - would normally extract text with mammoth");
    return "This is placeholder text for DOCX content. In production, actual DOCX text extraction would occur.";
  }
  
  // Default fallback
  return "Text extraction not supported for this file type.";
}

// Setup OpenAI client - Try multiple possible environment variable names
const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPENAI_KEY') || Deno.env.get('OPEN_AI_API_KEY') || Deno.env.get('OPENAI_SECRET_KEY');

console.log('Environment variables check:');
console.log('OPENAI_API_KEY exists:', !!Deno.env.get('OPENAI_API_KEY'));
console.log('OPENAI_KEY exists:', !!Deno.env.get('OPENAI_KEY'));
console.log('OPEN_AI_API_KEY exists:', !!Deno.env.get('OPEN_AI_API_KEY'));
console.log('OPENAI_SECRET_KEY exists:', !!Deno.env.get('OPENAI_SECRET_KEY'));
console.log('Final API key found:', !!openAIApiKey);
if (openAIApiKey) {
  console.log('API key starts with:', openAIApiKey.substring(0, 10) + '...');
  console.log('API key length:', openAIApiKey.length);
  console.log('API key format check:', openAIApiKey.startsWith('sk-'));
}

// Helper to analyze contract text with OpenAI
async function analyzeContractWithAI(text: string): Promise<any> {
  try {
    if (!openAIApiKey) {
      console.error('OpenAI API key is missing');
      throw new Error('OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.');
    }
    
    // Limit text length to avoid token limits
    const truncatedText = text.substring(0, 6000);
    
    const initialAnalysisPrompt = `You are a highly skilled legal and business analyst. Your task is to provide a comprehensive, actionable, and concise analysis of the provided contract document. This analysis is for a business owner or buyer who needs to quickly understand the core elements, potential risks, and key implications of the contract without legal jargon.

Contract Document Content:
${truncatedText}

---

Your analysis MUST be structured as a single JSON object with the following keys. If a section is not found or not applicable, use "N/A" or "Not found" for its value.

{
  "contract_summary": { "title": "Concise Summary of Contract", "content": "[A 3-5 sentence summary of the contract's overall purpose and key agreements.]" },
  "key_parties": { "title": "Key Parties Involved", "content": "[List all named parties and their roles (e.g., Seller: ABC Pty Ltd, Buyer: XYZ Corp, Landlord: John Doe).]" },
  "contract_type": { "title": "Contract Type Identified", "content": "[Identify the specific type of contract (e.g., Non-Disclosure Agreement, Asset Purchase Agreement, Commercial Lease Agreement, Service Agreement).]" },
  "key_obligations": { "title": "Key Obligations & Responsibilities", "content": "[Summarize main responsibilities and duties of each party. Use bullet points for clarity.]" },
  "financial_terms": { "title": "Financial Terms (if applicable)", "content": "[Extract and summarize any explicit financial terms, payments, pricing, or compensation mentioned. If none, state 'Not found'.]" },
  "timelines_and_dates": { "title": "Critical Timelines & Dates", "content": "[List all important dates, deadlines, or durations (e.g., 'Effective Date: 2025-01-01', 'Term: 5 years from Effective Date', 'Payment due within 30 days of invoice').]" },
  "termination_rules": { "title": "Termination & Exit Clauses", "content": "[Summarize conditions under which the contract can be terminated early, notice periods required, and any penalties or obligations upon termination.]" },
  "liabilities_and_indemnities": { "title": "Liabilities, Warranties & Indemnities", "content": "[Summarize clauses related to damages, indemnification, warranties, and limitations of liability.]" },
  "governing_law": { "title": "Governing Law", "content": "[State the governing law and jurisdiction (e.g., 'Laws of Victoria, Australia'). If not found, state 'Not found'.]" },
  "potential_risks_flags": { "title": "Potential Risks & Red Flags", "content": "[Identify any ambiguous language, missing standard clauses (e.g., no force majeure, no dispute resolution), unusually broad liabilities, or terms that seem unfavorable to a typical party in this type of contract. Use bullet points. If none, state 'None identified in a quick review.']" },
  "next_steps_suggestions": { "title": "Actionable Next Steps", "content": "[Based on the analysis, suggest 2-3 immediate actionable steps a business owner/buyer should consider regarding this contract (e.g., 'Consult with a lawyer regarding termination clauses', 'Verify financial terms with an accountant', 'Clarify ambiguous language').]" }
}

Important Rules for AI Output:
1. Your entire response MUST be a single, valid JSON object as specified above.
2. Extract information ONLY from the provided 'Contract Document Content'. Do NOT invent information or speculate.
3. If a specific piece of information is not found in the document, use "Not found" or "N/A" as the value for that specific content field.
4. Be concise and professional in all summaries and explanations.
5. Do NOT provide legal advice or financial advice. Your role is to analyze and present information.`;

    console.log('Making OpenAI API call...');
    console.log('Using API key starting with:', openAIApiKey.substring(0, 10) + '...');
    console.log('API endpoint: https://api.openai.com/v1/chat/completions');
    
    const requestBody = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a legal and business document analysis expert. Output valid JSON." },
        { role: "user", content: initialAnalysisPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.1,
    };
    
    console.log('Request model:', requestBody.model);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('OpenAI response status:', response.status);
    console.log('OpenAI response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status}. Error details: ${errorText}`);
    }
    
    const data = await response.json();
    const analysisResult = data.choices[0]?.message?.content;
    
    if (!analysisResult) {
      throw new Error('No analysis content received from OpenAI');
    }
    
    return JSON.parse(analysisResult);
  } catch (error) {
    console.error("Error analyzing with OpenAI:", error);
    throw error;
  }
}

// Helper to answer questions with OpenAI
async function answerQuestionWithAI(question: string, documentText: string): Promise<string> {
  try {
    if (!openAIApiKey) {
      console.error('OpenAI API key is missing');
      return 'OpenAI API key is not configured. Please contact the administrator to set up the OPENAI_API_KEY environment variable.';
    }
    
    const qaPrompt = `You are a helpful, deal-specific assistant. Your goal is to answer user questions about the provided document content.

Document Content:
${documentText}

---

User's Question:
${question}

Important Rules:
1. Answer the user's question concisely and directly.
2. Base your answer **ONLY** on the 'Document Content' provided. Do NOT invent information or speculate.
3. If the answer is NOT explicitly available in the provided 'Document Content', state clearly: 'I do not have enough information in the provided document to answer that question.' Do NOT make up information.
4. Do NOT provide legal advice, financial advice, or personal opinions.
5. Keep your answer brief and to the point.
6. Include the following disclaimer at the very end of your response: 'Disclaimer: This tool provides general legal information, not legal advice. Always consult a lawyer for final review.'`;

    console.log('Making OpenAI API call for Q&A...');
    console.log('Using API key starting with:', openAIApiKey.substring(0, 10) + '...');
    console.log('Using model: gpt-4o-mini');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant that answers questions based on provided text." },
          { role: "user", content: qaPrompt }
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    });
    
    console.log('Q&A OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      return `I'm currently unable to process your question due to an API configuration issue (Error ${response.status}). Error details: ${errorText}. Please contact the administrator to check the OpenAI API key and billing status.`;
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || 'No answer generated.';
  } catch (error) {
    console.error("Error answering question with OpenAI:", error);
    return `I'm currently unable to process your question due to a technical issue: ${error.message}. Please try again later or contact support.`;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { headers: corsHeaders, status: 405 }
    );
  }

  try {
    const contentType = req.headers.get('content-type');
    
    // Handle multipart form data (file upload for initial analysis)
    if (contentType?.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get("file");
      const requestType = formData.get("requestType");
      
      if (!file || !(file instanceof File)) {
        return new Response(
          JSON.stringify({ error: "No file provided or invalid file" }),
          { headers: corsHeaders, status: 400 }
        );
      }

      // Validate file type
      const allowedTypes = [
        "text/plain",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];
      
      if (!allowedTypes.includes(file.type)) {
        return new Response(
          JSON.stringify({ error: "Invalid file type. Please upload a .txt, .pdf, or .docx file." }),
          { headers: corsHeaders, status: 400 }
        );
      }
      
      // Limit file size (5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_FILE_SIZE) {
        return new Response(
          JSON.stringify({ error: "File too large. Maximum size is 5MB." }),
          { headers: corsHeaders, status: 400 }
        );
      }
      
      // Convert file to buffer
      const fileBuffer = new Uint8Array(await file.arrayBuffer());
      
      // Extract text from file
      const text = await extractTextFromFile(fileBuffer, file.type);
      
      if (!text || text.length < 50) {
        return new Response(
          JSON.stringify({ error: "Insufficient text extracted from document" }),
          { headers: corsHeaders, status: 422 }
        );
      }
      
      // Analyze the contract with AI
      const analysis = await analyzeContractWithAI(text);
      
      // Return the result
      return new Response(
        JSON.stringify({
          success: true,
          analysis,
          fullDocumentText: text
        }),
        { headers: corsHeaders }
      );
    }
    
    // Handle JSON requests (Q&A)
    else if (contentType?.includes('application/json')) {
      const requestBody = await req.json();
      const { requestType, userQuestion, fullDocumentText } = requestBody;
      
      if (requestType === 'answer_question') {
        if (!userQuestion || !fullDocumentText) {
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'Missing userQuestion or document context for Q&A.' 
            }),
            { headers: corsHeaders, status: 400 }
          );
        }
        
        const answer = await answerQuestionWithAI(userQuestion, fullDocumentText);
        
        return new Response(
          JSON.stringify({
            success: true,
            answer
          }),
          { headers: corsHeaders }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Invalid requestType for JSON body.' 
          }),
          { headers: corsHeaders, status: 400 }
        );
      }
    }
    
    else {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Invalid content type" 
        }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
  } catch (error) {
    console.error("Error in public-ai-analyzer:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to analyze document",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});

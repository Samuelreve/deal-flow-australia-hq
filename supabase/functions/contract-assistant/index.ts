
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.20.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContractAssistantRequest {
  requestType: 'answer_question' | 'summarize_contract_terms';
  dealId?: string;
  documentId?: string;
  versionId?: string;
  userQuestion?: string;
  // Legacy support for old format
  question?: string;
  contractText?: string;
  contractId?: string;
}

// Text extraction function for different file types
async function extractTextFromFile(fileContent: Uint8Array, mimeType: string): Promise<string> {
  try {
    if (mimeType === 'text/plain') {
      return new TextDecoder().decode(fileContent);
    }
    
    if (mimeType === 'application/pdf') {
      // For PDF files, we'll return a placeholder for now
      // In production, you'd want to use a PDF parsing library
      return "PDF text extraction not implemented yet. Please upload text files for now.";
    }
    
    if (mimeType.includes('text/')) {
      return new TextDecoder().decode(fileContent);
    }
    
    // For other file types, attempt text decoding
    try {
      return new TextDecoder().decode(fileContent);
    } catch {
      return "Unable to extract text from this file type.";
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    return "Error extracting text from file.";
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing');
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    const requestData: ContractAssistantRequest = await req.json();
    const supabase = createClient(supabaseUrl, supabaseKey);
    const openai = new OpenAI({ apiKey: openAIApiKey });

    // Handle new request types
    if (requestData.requestType === 'summarize_contract_terms') {
      console.log('Processing contract terms summarization request');
      
      const { dealId, documentId, versionId } = requestData;
      
      if (!dealId || !documentId || !versionId) {
        return new Response(
          JSON.stringify({ error: 'dealId, documentId, and versionId are required for summarization' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      // Get authentication context
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401 
          }
        );
      }

      // Verify user has access to this deal
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authentication' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401 
          }
        );
      }

      // Check if user is a participant in the deal
      const { data: participation, error: participationError } = await supabase
        .from('deal_participants')
        .select('id')
        .eq('deal_id', dealId)
        .eq('user_id', user.id)
        .single();

      if (participationError || !participation) {
        return new Response(
          JSON.stringify({ error: 'Access denied: You are not a participant in this deal' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403 
          }
        );
      }

      // Fetch document version details
      const { data: documentVersion, error: docError } = await supabase
        .from('document_versions')
        .select('storage_path, type')
        .eq('id', versionId)
        .eq('document_id', documentId)
        .single();

      if (docError || !documentVersion) {
        return new Response(
          JSON.stringify({ error: 'Document version not found' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404 
          }
        );
      }

      // Download file from storage
      const { data: fileData, error: storageError } = await supabase.storage
        .from('documents')
        .download(documentVersion.storage_path);

      if (storageError || !fileData) {
        return new Response(
          JSON.stringify({ error: 'Failed to download document' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }

      // Extract text from file
      const fileContent = new Uint8Array(await fileData.arrayBuffer());
      const fullDocumentText = await extractTextFromFile(fileContent, documentVersion.type);

      if (fullDocumentText.length < 50) {
        return new Response(
          JSON.stringify({ error: 'Document appears to be empty or text extraction failed' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      // Create summarization prompt
      const systemPrompt = `You are a professional legal document analyst specializing in contract analysis. Your task is to provide a comprehensive but accessible summary of contract terms and key provisions.

When summarizing contracts, focus on:
1. Parties involved and their roles
2. Key obligations and responsibilities
3. Financial terms and payment structures
4. Important dates and timelines
5. Termination conditions and clauses
6. Risk factors and liability provisions
7. Intellectual property considerations
8. Dispute resolution mechanisms

Provide your summary in clear, professional language that both legal professionals and business stakeholders can understand. Use bullet points and structured formatting where appropriate to enhance readability.`;

      const userPrompt = `Please provide a comprehensive summary of the following contract document. Focus on the key terms, obligations, financial aspects, and any notable provisions that parties should be aware of:

CONTRACT DOCUMENT:
${fullDocumentText}

Please structure your summary with clear sections and highlight the most critical aspects of this agreement.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const summary = completion.choices[0]?.message?.content || "I couldn't generate a summary. Please try again.";

      return new Response(
        JSON.stringify({
          summary,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    if (requestData.requestType === 'answer_question') {
      console.log('Processing enhanced Q&A request');
      
      const { dealId, documentId, versionId, userQuestion } = requestData;
      
      if (!dealId || !documentId || !versionId || !userQuestion) {
        return new Response(
          JSON.stringify({ error: 'dealId, documentId, versionId, and userQuestion are required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      // Get authentication context
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401 
          }
        );
      }

      // Verify user has access to this deal
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authentication' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401 
          }
        );
      }

      // Check if user is a participant in the deal
      const { data: participation, error: participationError } = await supabase
        .from('deal_participants')
        .select('id')
        .eq('deal_id', dealId)
        .eq('user_id', user.id)
        .single();

      if (participationError || !participation) {
        return new Response(
          JSON.stringify({ error: 'Access denied: You are not a participant in this deal' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403 
          }
        );
      }

      // Fetch document version details
      const { data: documentVersion, error: docError } = await supabase
        .from('document_versions')
        .select('storage_path, type')
        .eq('id', versionId)
        .eq('document_id', documentId)
        .single();

      if (docError || !documentVersion) {
        return new Response(
          JSON.stringify({ error: 'Document version not found' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404 
          }
        );
      }

      // Download file from storage
      const { data: fileData, error: storageError } = await supabase.storage
        .from('documents')
        .download(documentVersion.storage_path);

      if (storageError || !fileData) {
        return new Response(
          JSON.stringify({ error: 'Failed to download document' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }

      // Extract text from file
      const fileContent = new Uint8Array(await fileData.arrayBuffer());
      const fullDocumentText = await extractTextFromFile(fileContent, documentVersion.type);

      if (fullDocumentText.length < 50) {
        return new Response(
          JSON.stringify({ error: 'Document appears to be empty or text extraction failed' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      // Create Q&A prompt
      const systemPrompt = `You are a professional legal document analyst. Your role is to analyze contracts and legal documents to answer questions accurately and professionally.

When analyzing contracts, you should:
1. Provide clear, direct answers based on the contract content
2. Quote relevant sections when applicable
3. Identify potential risks or important considerations
4. Use professional legal terminology appropriately
5. If information is not in the contract, clearly state that

Format your responses to be clear and well-structured. Use plain English while maintaining professional accuracy.

IMPORTANT: Always base your answers strictly on the provided contract content. Do not make assumptions about clauses not present in the document.`;

      const userPrompt = `Please analyze the following contract and answer this question: "${userQuestion}"

CONTRACT CONTENT:
${fullDocumentText}

Please provide a comprehensive answer based on the contract content above.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const answer = completion.choices[0]?.message?.content || "I couldn't process your question. Please try again.";

      // Save the Q&A to database for history
      try {
        const { error: saveError } = await supabase
          .from('document_analyses')
          .insert({
            document_id: documentId,
            document_version_id: versionId,
            analysis_type: 'question_answer',
            analysis_content: {
              question: userQuestion,
              answer: answer,
              timestamp: new Date().toISOString()
            },
            created_by: user.id
          });

        if (saveError) {
          console.error('Failed to save Q&A to database:', saveError);
        }
      } catch (dbError) {
        console.error('Database save error:', dbError);
      }

      return new Response(
        JSON.stringify({
          answer,
          sources: ['AI Analysis of Contract Document'],
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Legacy support for old contract analysis format
    const { question, contractText, contractId } = requestData;

    if (!question || !contractText) {
      return new Response(
        JSON.stringify({ error: 'Question and contract text are required for legacy format' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log('Processing legacy contract question:', question.substring(0, 100));

    // Create a system prompt for contract analysis
    const systemPrompt = `You are a professional legal document analyst. Your role is to analyze contracts and legal documents to answer questions accurately and professionally.

When analyzing contracts, you should:
1. Provide clear, direct answers based on the contract content
2. Quote relevant sections when applicable
3. Identify potential risks or important considerations
4. Use professional legal terminology appropriately
5. If information is not in the contract, clearly state that

Format your responses to be clear and well-structured. Use plain English while maintaining professional accuracy.

IMPORTANT: Always base your answers strictly on the provided contract content. Do not make assumptions about clauses not present in the document.`;

    const userPrompt = `Please analyze the following contract and answer this question: "${question}"

CONTRACT CONTENT:
${contractText}

Please provide a comprehensive answer based on the contract content above.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    const answer = completion.choices[0]?.message?.content || "I couldn't process your question. Please try again.";

    // Save the Q&A to database for history (legacy format)
    if (contractId) {
      try {
        const { error: saveError } = await supabase
          .from('contract_questions')
          .insert({
            contract_id: contractId,
            question: question,
            answer: answer,
            sources: []
          });

        if (saveError) {
          console.error('Failed to save Q&A to database:', saveError);
        }
      } catch (dbError) {
        console.error('Database save error:', dbError);
      }
    }

    return new Response(
      JSON.stringify({
        answer,
        sources: ['AI Analysis of Contract Document'],
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Contract assistant error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process request',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.20.1";
import { Buffer } from "node:buffer";
import pdfParse from "https://esm.sh/pdf-parse@1.1.1";
import mammoth from "https://esm.sh/mammoth@1.6.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
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

// REALISTIC TEXT EXTRACTION HELPER IMPLEMENTATION
async function extractTextFromFile(fileBuffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
    // Handle plain text files directly
    return fileBuffer.toString('utf-8');
  } else if (mimeType === 'application/pdf') {
    // PDF Text Extraction
    try {
      // Use pdf-parse to extract text from the PDF buffer
      const data = await pdfParse(fileBuffer);
      if (data && data.text) {
        // Ensure text is trimmed and has content
        const extracted = data.text.trim();
        if (extracted.length < 50) {
          console.warn('PDF extracted text too short for analysis:', extracted.substring(0, 50));
          throw new Error("Insufficient text extracted from PDF. Document might be scanned, empty, or unreadable.");
        }
        return extracted;
      }
      throw new Error("No readable text content found in PDF.");
    } catch (e: any) {
      console.error('PDF parsing error (pdf-parse):', e.message);
      throw new Error(`Failed to extract text from PDF. It might be scanned or corrupted: ${e.message}`);
    }
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    // DOCX Text Extraction
    try {
      // mammoth expects an ArrayBuffer, so convert Deno Buffer's underlying ArrayBuffer
      const result = await mammoth.extractRawText({ arrayBuffer: fileBuffer.buffer });
      if (result && result.value) {
        const extracted = result.value.trim();
        if (extracted.length < 50) {
          console.warn('DOCX extracted text too short for analysis:', extracted.substring(0, 50));
          throw new Error("Insufficient text extracted from DOCX. Document might be too short, empty, or unreadable.");
        }
        return extracted;
      }
      throw new Error("No readable text content found in DOCX.");
    } catch (e: any) {
      console.error('DOCX parsing error (mammoth):', e.message);
      throw new Error(`Failed to extract text from DOCX. It might be corrupted or unsupported format: ${e.message}`);
    }
  }
  // Handle any other unsupported MIME types
  throw new Error(`Unsupported document type for text extraction: ${mimeType}.`);
}

serve(async (req) => {
  console.log('=== CONTRACT ASSISTANT REQUEST START ===');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('❌ OPENAI_API_KEY not found in environment');
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
      console.error('❌ Supabase configuration missing');
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    const requestData: ContractAssistantRequest = await req.json();
    console.log('📥 Contract assistant request:', JSON.stringify(requestData, null, 2));

    const supabase = createClient(supabaseUrl, supabaseKey);
    const openai = new OpenAI({ apiKey: openAIApiKey });

    // Handle legacy format (direct question/contractText/contractId)
    if (requestData.question && requestData.contractText && !requestData.requestType) {
      console.log('📝 Processing legacy question format');
      
      const { question, contractText, contractId } = requestData;
      
      if (!contractText || contractText.length < 50) {
        console.error('❌ Contract text too short or empty');
        return new Response(
          JSON.stringify({ error: 'Contract text is too short or empty for analysis' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      console.log('🤖 Processing legacy question with OpenAI');
      
      let answer = "";
      
      if (question.toLowerCase().includes("summar")) {
        const systemPrompt = `You are a professional legal document analyst. Provide a comprehensive contract summary focusing on key terms, obligations, financial aspects, and important provisions.`;
        
        const userPrompt = `Please provide a comprehensive summary of the following contract:

CONTRACT DOCUMENT:
${contractText}

Focus on: parties involved, key obligations, financial terms, important dates, termination conditions, and risk factors.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        });

        answer = completion.choices[0]?.message?.content || "I couldn't generate a summary. Please try again.";
      } else {
        const systemPrompt = `You are a professional contract analyst. Answer questions about contract content with accuracy and clarity. Provide specific information when available and note any limitations.`;
        
        const userPrompt = `Based on the following contract, please answer this question: ${question}

CONTRACT DOCUMENT:
${contractText}

Please provide a detailed answer based on the contract content.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 1500
        });

        answer = completion.choices[0]?.message?.content || "I couldn't answer the question. Please try again.";
      }

      console.log('✅ Legacy question processed successfully');
      
      return new Response(
        JSON.stringify({
          success: true,
          answer: answer,
          sources: ["AI Analysis", "Contract Content Review"],
          contractId: contractId
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Handle new request types
    if (requestData.requestType === 'summarize_contract_terms') {
      console.log('🔍 Processing contract terms summarization request');
      
      const { dealId, documentId, versionId } = requestData;
      
      if (!documentId || !versionId) {
        console.error('❌ Missing required parameters: documentId and versionId');
        return new Response(
          JSON.stringify({ error: 'documentId and versionId are required for summarization' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      // Get authentication context
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        console.error('❌ No authorization header found');
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401 
          }
        );
      }

      // Verify user authentication
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error('❌ Authentication failed:', authError);
        return new Response(
          JSON.stringify({ error: 'Invalid authentication' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401 
          }
        );
      }

      console.log('✅ User authenticated:', user.id);

      // For demo deals, skip participant check and fetch contract directly from contracts table
      if (dealId === 'demo-deal') {
        console.log('🎯 Processing demo contract, fetching from contracts table');
        
        // Fetch contract directly from contracts table
        const { data: contract, error: contractError } = await supabase
          .from('contracts')
          .select('content, name')
          .eq('id', documentId)
          .eq('user_id', user.id)
          .single();

        if (contractError || !contract) {
          console.error('❌ Contract not found:', contractError);
          return new Response(
            JSON.stringify({ error: 'Contract not found or access denied' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 404 
            }
          );
        }

        const contractText = contract.content;
        
        console.log('📄 Contract found:', {
          name: contract.name,
          contentType: typeof contractText,
          contentLength: contractText?.length || 0,
          contentPreview: contractText ? contractText.substring(0, 100) + '...' : 'No content',
          hasContent: !!contractText
        });
        
        if (!contractText || contractText.length < 50) {
          console.error('❌ Contract content is too short or empty:', {
            length: contractText?.length || 0,
            content: contractText
          });
          return new Response(
            JSON.stringify({ error: 'Contract content is too short or empty for analysis' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          );
        }

        console.log('🚀 Sending to OpenAI - Content length:', contractText.length);
        console.log('📝 Content preview (first 500 chars):', contractText.substring(0, 500));

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
${contractText}

Please structure your summary with clear sections and highlight the most critical aspects of this agreement.`;

        console.log('🤖 Calling OpenAI API...');

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

        console.log('✅ Summary generated successfully, length:', summary.length);

        return new Response(
          JSON.stringify({
            analysis: summary,
            timestamp: new Date().toISOString()
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }

      // For real deals, check participant access (existing code for production deals)
      const { data: participation, error: participationError } = await supabase
        .from('deal_participants')
        .select('id')
        .eq('deal_id', dealId)
        .eq('user_id', user.id)
        .single();

      if (participationError || !participation) {
        console.error('❌ User not a participant in deal:', participationError);
        return new Response(
          JSON.stringify({ error: 'Access denied: You are not a participant in this deal' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403 
          }
        );
      }

      // Fetch document version details for real deals
      const { data: documentVersion, error: docError } = await supabase
        .from('document_versions')
        .select('storage_path, type')
        .eq('id', versionId)
        .eq('document_id', documentId)
        .single();

      if (docError || !documentVersion) {
        console.error('❌ Document version not found:', docError);
        return new Response(
          JSON.stringify({ error: 'Document version not found' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404 
          }
        );
      }

      // Download file from storage for real deals
      const { data: fileData, error: storageError } = await supabase.storage
        .from('documents')
        .download(documentVersion.storage_path);

      if (storageError || !fileData) {
        console.error('❌ Failed to download document:', storageError);
        return new Response(
          JSON.stringify({ error: 'Failed to download document' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }

      // Extract text from file using proper extraction
      const fileContent = new Uint8Array(await fileData.arrayBuffer());
      const fileBuffer = Buffer.from(fileContent);
      
      console.log('📄 Attempting text extraction:', {
        type: documentVersion.type,
        fileSize: fileBuffer.length
      });

      let fullDocumentText: string;
      try {
        fullDocumentText = await extractTextFromFile(fileBuffer, documentVersion.type);
        
        console.log('✅ Text extraction successful:', {
          contentLength: fullDocumentText.length,
          contentPreview: fullDocumentText.substring(0, 200) + '...'
        });
      } catch (extractionError: any) {
        console.error('❌ Text extraction failed:', extractionError.message);
        return new Response(
          JSON.stringify({ error: `Text extraction failed: ${extractionError.message}` }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      // Generate summary for real deals (same as demo logic)
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
          analysis: summary,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    if (requestData.requestType === 'answer_question') {
      console.log('❓ Processing enhanced Q&A request');
      
      const { dealId, documentId, versionId, userQuestion } = requestData;
      
      if (!documentId || !versionId || !userQuestion) {
        console.error('❌ Missing required parameters for Q&A');
        return new Response(
          JSON.stringify({ error: 'documentId, versionId, and userQuestion are required' }),
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

      // Verify user authentication
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

      let contractText = '';

      // For demo deals, fetch from contracts table
      if (dealId === 'demo-deal') {
        const { data: contract, error: contractError } = await supabase
          .from('contracts')
          .select('content')
          .eq('id', documentId)
          .eq('user_id', user.id)
          .single();

        if (contractError || !contract) {
          return new Response(
            JSON.stringify({ error: 'Contract not found or access denied' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 404 
            }
          );
        }

        contractText = contract.content;
      } else {
        // For real deals, check participant access and fetch from storage
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

        // Extract text from file using proper extraction
        const fileContent = new Uint8Array(await fileData.arrayBuffer());
        const fileBuffer = Buffer.from(fileContent);
        
        try {
          contractText = await extractTextFromFile(fileBuffer, documentVersion.type);
          console.log('✅ Q&A text extraction successful:', {
            contentLength: contractText.length,
            contentPreview: contractText.substring(0, 200) + '...'
          });
        } catch (extractionError: any) {
          console.error('❌ Q&A text extraction failed:', extractionError.message);
          return new Response(
            JSON.stringify({ error: `Text extraction failed: ${extractionError.message}` }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          );
        }
      }

      if (!contractText || contractText.length < 50) {
        return new Response(
          JSON.stringify({ error: 'Contract content is too short or empty' }),
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
      console.error('❌ Missing question or contract text for legacy format');
      return new Response(
        JSON.stringify({ error: 'Question and contract text are required for legacy format' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log('🔄 Processing legacy contract question:', question.substring(0, 100));

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
    console.error('💥 Contract assistant error:', error);
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

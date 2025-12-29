import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.63.0";
import { Buffer } from "node:buffer";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-requested-with, accept, origin, referer, user-agent',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
};

// Function to clean AI response and apply proper formatting
function cleanAIResponse(text: string): string {
  if (!text) return text;
  
  return text
    .replace(/^#{1,6}\s*(\d+\.?\s*.*?)$/gm, '$1')
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/[*#]+/g, '')
    .replace(/^\s*[-•]\s*/gm, '- ')
    .replace(/^(\d+\.?\s*[A-Z][^:\n]*):?\s*$/gm, '$1')
    .replace(/[^\w\s\d.\-(),:;'"\/\n]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

interface ContractAssistantRequest {
  requestType: 'answer_question' | 'summarize_contract_terms';
  dealId?: string;
  documentId?: string;
  versionId?: string;
  userQuestion?: string;
  analysisType?: string;
  question?: string;
  contractText?: string;
  contractId?: string;
}

// Use the text-extractor service directly for proper DOCX handling
async function extractTextFromFile(fileBuffer: any, mimeType: string): Promise<string> {
  if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
    return fileBuffer.toString('utf-8');
  }
  
  try {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
    
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/text-extractor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        fileBase64: base64,
        mimeType: mimeType,
        fileName: 'contract.docx'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Text extraction service error (${response.status}):`, errorText);
      throw new Error(`Text extraction service error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      console.error('Text extraction failed:', result.error);
      throw new Error(result.error || "Text extraction failed");
    }
    
    return result.text;
    
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text from ${mimeType}: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing');
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const requestData: ContractAssistantRequest = await req.json();
    const supabase = createClient(supabaseUrl, supabaseKey);
    const openai = new OpenAI({ apiKey: openAIApiKey });

    // Handle legacy format (direct question/contractText/contractId)
    if (requestData.question && requestData.contractText && !requestData.requestType) {
      const { question, contractText, contractId } = requestData;
      
      if (!contractText || contractText.length < 50) {
        return new Response(
          JSON.stringify({ error: 'Contract text is too short or empty for analysis' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

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
        const systemPrompt = `You are a professional contract analyst. Answer questions about contract content with accuracy and clarity.`;
        
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

      return new Response(
        JSON.stringify({
          success: true,
          answer: answer,
          sources: ["AI Analysis", "Contract Content Review"],
          contractId: contractId
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle new request types
    if (requestData.requestType === 'summarize_contract_terms') {
      const { dealId, documentId, versionId } = requestData;
      
      if (!documentId || !versionId) {
        return new Response(
          JSON.stringify({ error: 'documentId and versionId are required for summarization' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authentication' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      // For direct contract analysis (no dealId) or demo deals
      if (!dealId || dealId === 'demo-deal') {
        const { data: contract, error: contractError } = await supabase
          .from('contracts')
          .select('content, name, mime_type')
          .eq('id', documentId)
          .eq('user_id', user.id)
          .single();

        if (contractError || !contract) {
          return new Response(
            JSON.stringify({ error: 'Contract not found or access denied' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          );
        }

        const contractText = contract.content;
        const minLength = contract.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? 10 : 50;
        
        if (!contractText || contractText.length < minLength) {
          return new Response(
            JSON.stringify({ 
              error: `Contract content is too short or empty for analysis (${contractText?.length || 0} chars, need ${minLength}+)`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        const getAnalysisPrompts = (analysisType: string) => {
          const baseSystemPrompt = `You are a concise contract analyst. Always provide extremely brief, direct analysis. Never exceed 6 sentences or 150 words. Use only plain text - NO markdown, asterisks, or special formatting.`;
          
          switch (analysisType) {
            case 'key_terms':
            case 'summary':
              return {
                systemPrompt: baseSystemPrompt,
                userPrompt: `Analyze KEY TERMS in EXACTLY 4-6 short sentences. Each sentence should be no more than 25 words.

FOCUS ON:
- Document type and parties
- Key obligations and financial terms
- Important dates or deadlines
- Termination or key provisions
- Maximum 150 words total

Contract content:
${contractText.substring(0, 6000)}

Key Terms Analysis:`
              };
            
            case 'risk_assessment':
            case 'risks':
              return {
                systemPrompt: baseSystemPrompt,
                userPrompt: `Identify RISKS in EXACTLY 4-6 short sentences. Each sentence should be no more than 25 words.

FOCUS ON:
- Financial risks and liability exposure
- Performance risks and penalties
- Termination risks and conditions
- Compliance risks and requirements
- Maximum 150 words total

Contract content:
${contractText.substring(0, 6000)}

Risk Assessment:`
              };
            
            case 'obligations':
              return {
                systemPrompt: baseSystemPrompt,
                userPrompt: `Analyze OBLIGATIONS in EXACTLY 4-6 short sentences. Each sentence should be no more than 25 words.

FOCUS ON:
- Each party's key responsibilities
- Performance requirements and standards
- Delivery obligations and timelines
- Reporting and communication duties
- Maximum 150 words total

Contract content:
${contractText.substring(0, 6000)}

Obligations Analysis:`
              };
            
            default:
              return {
                systemPrompt: baseSystemPrompt,
                userPrompt: `Provide a BRIEF contract analysis in EXACTLY 4-6 short sentences. Each sentence should be no more than 25 words.

Contract content:
${contractText.substring(0, 6000)}

Analysis:`
              };
          }
        };

        const { systemPrompt, userPrompt } = getAnalysisPrompts(requestData.analysisType || 'summary');

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 200
        });

        const summary = cleanAIResponse(completion.choices[0]?.message?.content || "I couldn't generate a summary. Please try again.");

        return new Response(
          JSON.stringify({
            analysis: summary,
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // For real deals, check participant access
      const { data: participation, error: participationError } = await supabase
        .from('deal_participants')
        .select('id')
        .eq('deal_id', dealId)
        .eq('user_id', user.id)
        .single();

      if (participationError || !participation) {
        return new Response(
          JSON.stringify({ error: 'Access denied: You are not a participant in this deal' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      const { data: documentVersion, error: docError } = await supabase
        .from('document_versions')
        .select('storage_path, type')
        .eq('id', versionId)
        .eq('document_id', documentId)
        .single();

      if (docError || !documentVersion) {
        return new Response(
          JSON.stringify({ error: 'Document version not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      const { data: fileData, error: storageError } = await supabase.storage
        .from('documents')
        .download(documentVersion.storage_path);

      if (storageError || !fileData) {
        return new Response(
          JSON.stringify({ error: 'Failed to download document' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      const fileContent = new Uint8Array(await fileData.arrayBuffer());
      const fileBuffer = Buffer.from(fileContent);

      let fullDocumentText: string;
      try {
        fullDocumentText = await extractTextFromFile(fileBuffer, documentVersion.type);
      } catch (extractionError: any) {
        console.error('Text extraction failed:', extractionError.message);
        return new Response(
          JSON.stringify({ error: `Text extraction failed: ${extractionError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const url = new URL(req.url);
      const analysisType = url.searchParams.get('analysisType') || requestData.analysisType || 'summary';
      
      let systemPrompt = '';
      let userPrompt = '';
      
      if (analysisType === 'summary') {
        systemPrompt = `You are a professional legal document analyst. Provide a comprehensive contract summary in clear, accessible language.`;
        userPrompt = `Please provide a clear and comprehensive summary of this contract:

CONTRACT DOCUMENT:
${fullDocumentText}

Focus on: main purpose and scope, parties involved, key obligations, financial terms, important dates, termination conditions.`;
        
      } else if (analysisType === 'keyTerms') {
        systemPrompt = `You are a legal expert specializing in contract analysis. Extract and explain the most important terms and definitions.`;
        userPrompt = `Extract and explain the key terms and important clauses from this contract:

CONTRACT DOCUMENT:
${fullDocumentText}

Identify: critical definitions, important clauses, rights and obligations, payment terms, performance requirements, compliance requirements.`;
        
      } else if (analysisType === 'risks') {
        systemPrompt = `You are a legal risk analyst specializing in contract review. Identify potential risks and areas of concern.`;
        userPrompt = `Analyze this contract for potential risks and liabilities:

CONTRACT DOCUMENT:
${fullDocumentText}

Identify: financial risks, performance risks, legal compliance risks, termination risks, IP risks, dispute resolution challenges.`;
        
      } else if (analysisType === 'suggestions') {
        systemPrompt = `You are a contract optimization expert. Review contracts and provide practical improvement suggestions.`;
        userPrompt = `Review this contract and provide improvement suggestions:

CONTRACT DOCUMENT:
${fullDocumentText}

Suggest improvements for: clarity, protection, risk mitigation, performance monitoring, dispute resolution, compliance.`;
        
      } else {
        systemPrompt = `You are a professional legal document analyst. Provide a comprehensive contract analysis.`;
        userPrompt = `Please provide a comprehensive analysis of this contract:

CONTRACT DOCUMENT:
${fullDocumentText}

Include: summary, key terms, potential risks, and recommendations.`;
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const analysis = completion.choices[0]?.message?.content || "I couldn't generate the analysis. Please try again.";

      return new Response(
        JSON.stringify({
          analysis: analysis,
          analysisType: analysisType,
          timestamp: new Date().toISOString(),
          sources: ["AI Analysis", "Contract Content Review"]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    if (requestData.requestType === 'answer_question') {
      const { dealId, documentId, versionId, userQuestion } = requestData;
      
      if (!documentId || !versionId || !userQuestion) {
        return new Response(
          JSON.stringify({ error: 'documentId, versionId, and userQuestion are required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authentication' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      let contractText = '';

      if (dealId === 'demo-deal') {
        const { data: contract, error: contractError } = await supabase
          .from('contracts')
          .select('content, mime_type')
          .eq('id', documentId)
          .eq('user_id', user.id)
          .single();

        if (contractError || !contract) {
          return new Response(
            JSON.stringify({ error: 'Contract not found or access denied' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          );
        }

        if (contract.content.startsWith('N docProps PKN') || contract.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          try {
            const contentBuffer = Buffer.from(contract.content, 'binary');
            contractText = await extractTextFromFile(contentBuffer, contract.mime_type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
          } catch (extractionError: any) {
            console.error('Text extraction failed for demo contract:', extractionError.message);
            return new Response(
              JSON.stringify({ error: `Failed to extract text from demo contract: ${extractionError.message}` }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
          }
        } else {
          contractText = contract.content;
        }
      } else {
        const { data: participation, error: participationError } = await supabase
          .from('deal_participants')
          .select('id')
          .eq('deal_id', dealId)
          .eq('user_id', user.id)
          .single();

        if (participationError || !participation) {
          return new Response(
            JSON.stringify({ error: 'Access denied: You are not a participant in this deal' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          );
        }

        const { data: documentVersion, error: docError } = await supabase
          .from('document_versions')
          .select('storage_path, type')
          .eq('id', versionId)
          .eq('document_id', documentId)
          .single();

        if (docError || !documentVersion) {
          return new Response(
            JSON.stringify({ error: 'Document version not found' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          );
        }

        const { data: fileData, error: storageError } = await supabase.storage
          .from('documents')
          .download(documentVersion.storage_path);

        if (storageError || !fileData) {
          return new Response(
            JSON.stringify({ error: 'Failed to download document' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        const fileContent = new Uint8Array(await fileData.arrayBuffer());
        const fileBuffer = Buffer.from(fileContent);
        
        try {
          contractText = await extractTextFromFile(fileBuffer, documentVersion.type);
        } catch (extractionError: any) {
          console.error('Text extraction failed:', extractionError.message);
          return new Response(
            JSON.stringify({ error: `Text extraction failed: ${extractionError.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      }

      if (!contractText || contractText.length < 50) {
        return new Response(
          JSON.stringify({ error: 'Contract content is too short or empty' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const systemPrompt = `You are a professional legal document analyst. Analyze contracts to answer questions accurately.

When analyzing:
1. Provide clear, direct answers based on the contract content
2. Quote relevant sections when applicable
3. Identify potential risks or considerations
4. If information is not in the contract, clearly state that

IMPORTANT: Always base answers strictly on the provided contract content.`;

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
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Legacy support for old contract analysis format
    const { question, contractText, contractId } = requestData;

    if (!question || !contractText) {
      return new Response(
        JSON.stringify({ error: 'Question and contract text are required for legacy format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const systemPrompt = `You are a professional legal document analyst. Analyze contracts to answer questions accurately.

When analyzing:
1. Provide clear, direct answers based on the contract content
2. Quote relevant sections when applicable
3. Identify potential risks or considerations
4. If information is not in the contract, clearly state that

IMPORTANT: Always base answers strictly on the provided contract content.`;

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
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Contract assistant error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process request',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

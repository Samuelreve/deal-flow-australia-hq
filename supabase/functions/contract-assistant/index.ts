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

// Use the text-extractor service directly for proper DOCX handling
async function extractTextFromFile(fileBuffer: any, mimeType: string): Promise<string> {
  if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
    return fileBuffer.toString('utf-8');
  }
  
  // For other file types, use the text-extractor service directly
  try {
    console.log('🔧 Extracting text using text-extractor service for type:', mimeType);
    
    // Convert buffer to base64 for the text-extractor service
    const base64 = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
    
    console.log('📤 Calling text-extractor service...');
    
    // Call the text-extractor Edge Function directly
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
      console.error(`❌ Text extraction service error (${response.status}):`, errorText);
      throw new Error(`Text extraction service error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ Text extraction failed:', result.error);
      throw new Error(result.error || "Text extraction failed");
    }
    
    console.log(`✅ Text extraction successful: ${result.text.length} characters`);
    return result.text;
    
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text from ${mimeType}: ${error.message}`);
  }
}

serve(async (req) => {
  console.log('=== CONTRACT ASSISTANT REQUEST START ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  // Handle CORS preflight requests FIRST
  if (req.method === 'OPTIONS') {
    console.log("✅ Handling OPTIONS preflight request");
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
    
    // Enhanced debugging for all request types
    console.log('🔍 FULL REQUEST DEBUG:', {
      requestType: requestData.requestType,
      dealId: requestData.dealId,
      documentId: requestData.documentId,
      versionId: requestData.versionId,
      hasUserQuestion: !!requestData.userQuestion,
      hasQuestion: !!requestData.question,
      hasContractText: !!requestData.contractText,
      hasContractId: !!requestData.contractId,
      allKeys: Object.keys(requestData)
    });

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
      console.log('📋 Request data values:', {
        dealId: requestData.dealId,
        documentId: requestData.documentId,
        versionId: requestData.versionId,
        documentIdType: typeof requestData.documentId,
        versionIdType: typeof requestData.versionId,
        documentIdLength: requestData.documentId?.length,
        versionIdLength: requestData.versionId?.length
      });
      
      const { dealId, documentId, versionId } = requestData;
      
      if (!documentId || !versionId) {
        console.error('❌ Missing required parameters: documentId and versionId');
        console.error('❌ Values received:', { documentId, versionId, dealId });
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

      // For direct contract analysis (no dealId) or demo deals, fetch contract directly from contracts table
      if (!dealId || dealId === 'demo-deal') {
        console.log('🎯 Processing demo contract, fetching from contracts table');
        
        // Fetch contract directly from contracts table
        const { data: contract, error: contractError } = await supabase
          .from('contracts')
          .select('content, name, mime_type')
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

        // For demo contracts, content is already stored as text
        const contractText = contract.content;
        
        console.log('📄 Contract found:', {
          name: contract.name,
          mimeType: contract.mime_type,
          contentType: typeof contractText,
          contentLength: contractText?.length || 0,
          contentPreview: contractText ? contractText.substring(0, 200) + '...' : 'No content',
          hasContent: !!contractText,
          isDocx: contract.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        
        // Enhanced debugging for DOCX files
        if (contract.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          console.log('🔍 DOCX DEBUG - Full content analysis:', {
            contentLength: contractText?.length || 0,
            contentBytes: contractText ? new TextEncoder().encode(contractText).length : 0,
            hasTextContent: !!(contractText && contractText.trim()),
            trimmedLength: contractText ? contractText.trim().length : 0,
            firstChars: contractText ? Array.from(contractText.substring(0, 10)).map(c => `${c} (${c.charCodeAt(0)})`).join(', ') : 'No content',
            containsWords: contractText ? /[a-zA-Z]{3,}/.test(contractText) : false,
            fullContent: contractText || 'NO CONTENT'
          });
        }
        
        // Temporarily lower threshold for debugging DOCX files
        const minLength = contract.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? 10 : 50;
        
        if (!contractText || contractText.length < minLength) {
          console.error('❌ Contract content is too short or empty:', {
            length: contractText?.length || 0,
            minRequired: minLength,
            mimeType: contract.mime_type,
            content: contractText?.substring(0, 200) || 'NO CONTENT'
          });
          return new Response(
            JSON.stringify({ 
              error: `Contract content is too short or empty for analysis (${contractText?.length || 0} chars, need ${minLength}+)`,
              debug: {
                mimeType: contract.mime_type,
                contentLength: contractText?.length || 0,
                contentPreview: contractText?.substring(0, 100) || 'NO CONTENT'
              }
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          );
        }

        console.log('🚀 Sending to OpenAI - Content length:', contractText.length);
        console.log('📝 Content preview (first 500 chars):', contractText.substring(0, 500));

        // Create summarization prompt for structured response
        const systemPrompt = `You are a professional legal document analyst specializing in contract analysis. Provide a comprehensive but accessible summary of contract terms and key provisions.

Respond with a JSON object containing:
1. summary: A 3-4 sentence concise summary of the contract
2. keyPoints: Array of 5-8 key points about the contract
3. documentType: Type of document (e.g., "Professional Services Agreement", "Employment Contract", etc.)
4. wordCount: Approximate word count of the contract

Focus on: parties involved, key obligations, financial terms, important dates, termination conditions, and risk factors.

Example response format:
{
  "summary": "This is a professional services agreement between Company A and Company B for software development services. The contract establishes the scope of work, payment terms, and delivery timeline. Both parties have specific obligations regarding project completion and intellectual property rights. The agreement includes standard termination clauses and dispute resolution procedures.",
  "keyPoints": [
    "Parties: Company A (client) and Company B (service provider)",
    "Services: Software development and implementation",
    "Duration: 12-month project timeline",
    "Payment: $50,000 total, payable in monthly installments",
    "Deliverables: Custom software application and documentation"
  ],
  "documentType": "Professional Services Agreement",
  "wordCount": 2500
}`

        const userPrompt = `Please analyze the following contract document and provide a structured JSON response:

CONTRACT DOCUMENT:
${contractText}

Analyze this contract and provide the response in the exact JSON format specified.`;

        console.log('🤖 Calling OpenAI API...');

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 2000,
          response_format: { type: "json_object" }
        });

        const aiResponse = completion.choices[0]?.message?.content || "{}";
        
        console.log('✅ Summary generated successfully, length:', aiResponse.length);

        try {
          const structuredResult = JSON.parse(aiResponse);
          
          // Add disclaimer and ensure all fields are present
          const finalResult = {
            summary: structuredResult.summary || "Contract analysis completed successfully.",
            keyPoints: structuredResult.keyPoints || [],
            documentType: structuredResult.documentType || "Contract",
            wordCount: structuredResult.wordCount || Math.round(contractText.length / 5),
            disclaimer: "This AI analysis is for informational purposes only and should not be considered legal advice. Always consult with a qualified attorney for legal matters.",
            timestamp: new Date().toISOString()
          };

          return new Response(
            JSON.stringify(finalResult),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          );
        } catch (parseError) {
          console.error('❌ Failed to parse AI response as JSON:', parseError);
          
          // Fallback to simple response
          return new Response(
            JSON.stringify({
              summary: aiResponse,
              keyPoints: [],
              documentType: "Contract",
              wordCount: Math.round(contractText.length / 5),
              disclaimer: "This AI analysis is for informational purposes only and should not be considered legal advice. Always consult with a qualified attorney for legal matters.",
              timestamp: new Date().toISOString()
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          );
        }
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

      // Generate analysis based on specific analysis type requested
      let systemPrompt = '';
      let userPrompt = '';
      
      // Check if this is a specific analysis type request (extract from query params or headers)
      const url = new URL(req.url);
      const analysisType = url.searchParams.get('analysisType') || requestData.analysisType || 'summary';
      
      console.log('🎯 Analysis type requested:', analysisType);
      
      if (analysisType === 'summary') {
        systemPrompt = `You are a professional legal document analyst. Provide a comprehensive contract summary in clear, accessible language. Focus on the main purpose, parties, and key provisions.`;
        
        userPrompt = `Please provide a clear and comprehensive summary of this contract:

CONTRACT DOCUMENT:
${fullDocumentText}

Focus on:
- Main purpose and scope of the agreement
- Parties involved and their roles
- Key obligations and responsibilities
- Financial terms and payment structures
- Important dates and timelines
- Termination conditions

Provide a well-structured summary that business stakeholders can easily understand.`;
        
      } else if (analysisType === 'keyTerms') {
        systemPrompt = `You are a legal expert specializing in contract analysis. Extract and explain the most important terms, clauses, and definitions from contracts. Present them in a clear, structured format.`;
        
        userPrompt = `Extract and explain the key terms and important clauses from this contract:

CONTRACT DOCUMENT:
${fullDocumentText}

Please identify and explain:
- Critical definitions and key terms
- Important clauses and provisions
- Rights and obligations of each party
- Payment terms and financial obligations
- Performance requirements
- Compliance and regulatory requirements

Present each key term with a brief explanation of its significance.`;
        
      } else if (analysisType === 'risks') {
        systemPrompt = `You are a legal risk analyst specializing in contract review. Identify potential risks, liabilities, and areas of concern in contracts. Focus on practical business implications.`;
        
        userPrompt = `Analyze this contract for potential risks and liabilities:

CONTRACT DOCUMENT:
${fullDocumentText}

Please identify:
- Financial risks and liability exposure
- Performance and delivery risks
- Legal and regulatory compliance risks
- Termination and penalty risks
- Intellectual property risks
- Force majeure and unforeseen circumstances
- Dispute resolution challenges

For each risk, explain the potential impact and suggest mitigation strategies where appropriate.`;
        
      } else if (analysisType === 'suggestions') {
        systemPrompt = `You are a contract optimization expert. Review contracts and provide practical suggestions for improvements, better protection, and enhanced clarity.`;
        
        userPrompt = `Review this contract and provide improvement suggestions:

CONTRACT DOCUMENT:
${fullDocumentText}

Please suggest improvements for:
- Clarity and precision of language
- Better protection for parties
- Risk mitigation strategies
- Performance monitoring mechanisms
- Dispute resolution enhancements
- Compliance and regulatory alignment

Provide practical, actionable recommendations that would benefit both parties.`;
        
      } else {
        // Default fallback to general summary
        systemPrompt = `You are a professional legal document analyst. Provide a comprehensive contract analysis covering key terms, risks, and recommendations.`;
        
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
          .select('content, mime_type')
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

        // Check if content is binary data that needs extraction
        if (contract.content.startsWith('N docProps PKN') || contract.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          console.log('📄 Detected binary DOCX content for Q&A, extracting text...');
          try {
            // Convert content string back to buffer for text extraction
            const contentBuffer = Buffer.from(contract.content, 'binary');
            contractText = await extractTextFromFile(contentBuffer, contract.mime_type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            console.log('✅ Text extraction successful for demo contract Q&A');
          } catch (extractionError: any) {
            console.error('❌ Text extraction failed for demo contract Q&A:', extractionError.message);
            return new Response(
              JSON.stringify({ error: `Failed to extract text from demo contract: ${extractionError.message}` }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400 
              }
            );
          }
        } else {
          contractText = contract.content;
        }
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

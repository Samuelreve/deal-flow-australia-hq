
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function handleSummarizeDocument(
  content: string,
  context: any,
  openai: any
) {
  try {
    console.log('🚀 UPDATED AI-powered document summarization starting...');
    console.log('📝 Content length:', content?.length || 0);
    console.log('🔧 Context:', context);

    // Initialize Supabase client if we need to fetch document content
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let documentContent = content;

    // If content is empty, try to fetch from document using content retrieval function
    if (!documentContent || documentContent.trim().length === 0) {
      console.log('📄 Fetching document content using content retrieval function...');
      
      if (context?.documentVersionId && context?.dealId) {
        console.log('🔍 Calling document-content-retrieval for version:', context.documentVersionId);
        try {
          const { data: contentResult, error: contentError } = await supabase.functions
            .invoke('document-content-retrieval', {
              body: {
                versionId: context.documentVersionId,
                dealId: context.dealId
              }
            });

          if (!contentError && contentResult?.content) {
            documentContent = contentResult.content;
            console.log('✅ Found document content via retrieval function:', documentContent.length);
          } else {
            console.error('❌ Error from content retrieval function:', contentError);
          }
        } catch (retrievalError) {
          console.error('❌ Failed to call content retrieval function:', retrievalError);
        }
      }
      
      // Fallback to direct database query if content retrieval fails
      if ((!documentContent || documentContent.trim().length === 0) && context?.documentVersionId) {
        console.log('🔍 Fallback: Looking for document version in database:', context.documentVersionId);
        const { data: docVersion, error: versionError } = await supabase
          .from('document_versions')
          .select('text_content')
          .eq('id', context.documentVersionId)
          .single();
        
        if (!versionError && docVersion?.text_content) {
          documentContent = docVersion.text_content;
          console.log('✅ Found document version content in database:', documentContent.length);
        }
      }
      
      // Try to get content from contracts table if no version content found
      if ((!documentContent || documentContent.trim().length === 0) && context?.documentId) {
        console.log('🔍 Looking for contract:', context.documentId);
        const { data: contract, error } = await supabase
          .from('contracts')
          .select('content, name, text_content')
          .eq('id', context.documentId)
          .single();
        
        if (error) {
          console.error('❌ Error fetching contract:', error);
        } else if (contract) {
          // Use text_content first, fallback to content
          documentContent = contract.text_content || contract.content || '';
          console.log('✅ Found contract content:', {
            name: contract.name,
            contentLength: documentContent.length,
            hasTextContent: !!contract.text_content,
            hasContent: !!contract.content
          });
        }
      }
    }

    if (!documentContent || documentContent.trim().length === 0) {
      console.log('❌ No document content found');
      return {
        success: true,
        summary: 'No document content available for summarization. Please ensure the document has been properly uploaded and processed.',
        keyPoints: [],
        documentType: 'unknown',
        disclaimer: 'Document summarization requires valid content input.'
      };
    }

    console.log('🤖 Generating AI summary with OpenAI...');
    
    // Import enhanced prompts
    const { DOCUMENT_SUMMARY_PROMPT } = await import("../_shared/ai-prompts.ts");
    
    // Truncate content if too long (OpenAI token limits)
    const maxContentLength = 12000; // Roughly 3000 tokens for GPT-4
    const truncatedContent = documentContent.length > maxContentLength 
      ? documentContent.substring(0, maxContentLength) + '...' 
      : documentContent;

    // Create the prompt for concise summarization
    const prompt = `${DOCUMENT_SUMMARY_PROMPT}

Document content:
${truncatedContent}

Summary:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are **Trustroom Document Analyst**, an expert at rapidly extracting key information from business documents. Always provide extremely brief, direct summaries. Never exceed 4 sentences or 100 words.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.1
    });

    const aiSummary = completion.choices[0].message.content;
    console.log('🤖 AI Summary generated:', aiSummary);

    // Extract key points using AI
    const keyPointsPrompt = `Extract 3-4 key facts from this document as very short bullet points (max 10 words each):

Document content:
${truncatedContent}

Key facts:`;

    const keyPointsCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Extract key facts as very short bullet points. Each point must be under 10 words.'
        },
        {
          role: 'user',
          content: keyPointsPrompt
        }
      ],
      max_tokens: 100,
      temperature: 0.1
    });

    const keyPointsText = keyPointsCompletion.choices[0].message.content;
    // Parse the key points from the AI response
    const keyPoints = keyPointsText
      .split('\n')
      .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map(point => point.replace(/^[•\-*]\s*/, '').trim())
      .filter(point => point.length > 0);

    // Basic document type detection
    const cleanContent = documentContent.toLowerCase();
    let documentType = 'Document';
    if (cleanContent.includes('agreement') || cleanContent.includes('contract')) {
      documentType = 'Contract';
    } else if (cleanContent.includes('invoice') || cleanContent.includes('payment')) {
      documentType = 'Financial Document';
    } else if (cleanContent.includes('policy') || cleanContent.includes('procedure')) {
      documentType = 'Policy Document';
    }

    console.log('✅ AI document summarization completed');
    console.log('📄 Summary length:', aiSummary?.length || 0);
    console.log('🔑 Key points extracted:', keyPoints.length);
    console.log('📋 Final summary being returned:', aiSummary);

    return {
      success: true,
      summary: aiSummary,
      keyPoints,
      documentType,
      wordCount: documentContent.split(/\s+/).length,
      disclaimer: 'This AI-generated summary is for informational purposes only and should not be considered legal advice. Always consult with a qualified attorney for legal matters.'
    };
  } catch (error) {
    console.error('❌ Error in handleSummarizeDocument:', error);
    throw new Error(`Failed to summarize document: ${error.message}`);
  }
}

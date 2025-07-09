
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function handleSummarizeDocument(
  content: string,
  context: any,
  openai: any
) {
  try {
    console.log('📋 Starting AI-powered document summarization...');
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

    // If content is empty, try to fetch from document version or contract
    if (!documentContent || documentContent.trim().length === 0) {
      console.log('📄 Fetching document content from database...');
      
      // Try to get content from document version first
      if (context?.documentVersionId) {
        console.log('🔍 Looking for document version:', context.documentVersionId);
        const { data: docVersion, error: versionError } = await supabase
          .from('document_versions')
          .select('text_content')
          .eq('id', context.documentVersionId)
          .single();
        
        if (!versionError && docVersion?.text_content) {
          documentContent = docVersion.text_content;
          console.log('✅ Found document version content:', documentContent.length);
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
    
    // Truncate content if too long (OpenAI token limits)
    const maxContentLength = 12000; // Roughly 3000 tokens for GPT-4
    const truncatedContent = documentContent.length > maxContentLength 
      ? documentContent.substring(0, maxContentLength) + '...' 
      : documentContent;

    // Create the prompt for concise summarization
    const prompt = `You are an expert document analyzer. Please provide a concise summary of the following document in exactly 3-5 sentences. Focus on the most important information including:

- Main purpose/type of document
- Key parties involved (if any)
- Critical terms, amounts, or dates
- Primary obligations or conditions
- Any important deadlines or actions required

Keep the summary professional, clear, and informative. Do not include disclaimers or metadata - just the essential content summary.

Document content:
${truncatedContent}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert legal and business document analyst. Provide clear, concise summaries that capture the essential information.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.3
    });

    const aiSummary = completion.choices[0].message.content;

    // Extract key points using AI
    const keyPointsPrompt = `Based on the following document, extract 3-5 key points or highlights as a bulleted list. Focus on the most important aspects like parties, amounts, dates, obligations, or critical terms. Format as simple bullet points without extra formatting.

Document content:
${truncatedContent}`;

    const keyPointsCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Extract key points from documents in a clear, bulleted format.'
        },
        {
          role: 'user',
          content: keyPointsPrompt
        }
      ],
      max_tokens: 200,
      temperature: 0.3
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

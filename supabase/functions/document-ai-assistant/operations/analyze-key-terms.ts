import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

export async function handleAnalyzeKeyTerms(content: string, context: any, openai: any): Promise<any> {
  console.log('🔑 Key Terms Analysis starting with context:', context);
  
  let documentContent = content;
  
  // If no content provided, fetch from database
  if (!documentContent) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
      // Try to get from document_versions first (more specific)
      if (context.documentVersionId) {
        const { data: versionData, error: versionError } = await supabase
          .from('document_versions')
          .select('text_content')
          .eq('id', context.documentVersionId)
          .single();
          
        if (!versionError && versionData?.text_content) {
          documentContent = versionData.text_content;
          console.log('📄 Got content from document_versions table');
        }
      }
      
      // Fallback to contracts table
      if (!documentContent && context.documentId) {
        const { data: contractData, error: contractError } = await supabase
          .from('contracts')
          .select('text_content, content')
          .eq('id', context.documentId)
          .single();
          
        if (!contractError && contractData) {
          documentContent = contractData.text_content || contractData.content;
          console.log('📄 Got content from contracts table');
        }
      }
    } catch (error) {
      console.error('Error fetching document content:', error);
    }
  }
  
  if (!documentContent) {
    return {
      keyTerms: ['Unable to analyze - document content not found'],
      disclaimer: 'This analysis is provided by AI and should be reviewed by qualified professionals for accuracy and completeness.'
    };
  }
  
  // Truncate content to stay within token limits (approximately 12,000 tokens for GPT-4o-mini)
  const maxLength = 48000; // Roughly 12k tokens in characters
  const truncatedContent = documentContent.length > maxLength 
    ? documentContent.substring(0, maxLength) + "..."
    : documentContent;

  try {
    // Generate concise key terms using OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a legal document analyst. Extract ONLY the most important key terms from contracts.

CRITICAL INSTRUCTIONS:
- Return EXACTLY 5-7 key terms maximum
- Each term should be 1-4 words only (e.g., "Purchase Price", "Closing Date", "Shares")
- Focus on the most essential contract elements
- NO explanations, NO descriptions, NO full sentences
- Return as a simple JSON array of strings

Examples of good terms: ["Purchase Price", "Closing Date", "Shares", "Representations", "Indemnification"]
Examples of bad terms: ["The purchase price is $333,333", "Complex indemnification clause requiring review"]`
        },
        {
          role: 'user',
          content: `Extract the key terms from this document:\n\n${truncatedContent}`
        }
      ],
      temperature: 0.1, // Very low temperature for consistent, focused output
      max_tokens: 200   // Limit response length
    });

    let keyTerms = [];
    let responseText = response.choices[0]?.message?.content || '';
    
    // Clean up markdown formatting and unwanted text from the response
    responseText = responseText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .replace(/^\s*\[/g, '[')  // Remove leading whitespace before array
      .replace(/\]\s*$/g, ']')  // Remove trailing whitespace after array
      .trim();
    
    try {
      // Try to parse as JSON array
      keyTerms = JSON.parse(responseText);
      
      // Ensure it's an array and clean up the terms
      if (!Array.isArray(keyTerms)) {
        // If it's not an array, try to extract terms from the response
        keyTerms = responseText
          .split(/[\n,]/)
          .map(term => term.trim().replace(/['"]/g, ''))
          .filter(term => term.length > 0 && term.length < 50 && !term.includes('```') && !term.toLowerCase().includes('json'))
          .slice(0, 7);
      } else {
        // Clean up each term in the array
        keyTerms = keyTerms
          .map(term => typeof term === 'string' ? term.trim().replace(/['"]/g, '') : String(term).trim())
          .filter(term => term.length > 0 && term.length < 50 && !term.includes('```') && !term.toLowerCase().includes('json'))
          .slice(0, 7);
      }
      
    } catch (parseError) {
      console.log('Could not parse as JSON, treating as text');
      // Fallback: split by lines/commas and clean up thoroughly
      keyTerms = responseText
        .split(/[\n,]/)
        .map(term => term.trim().replace(/['"]/g, '').replace(/^\d+\.\s*/, '')) // Remove quotes and numbering
        .filter(term => 
          term.length > 0 && 
          term.length < 50 && 
          !term.includes('```') && 
          !term.toLowerCase().includes('json') &&
          !term.toLowerCase().includes('markdown') &&
          term !== '[' && term !== ']'
        )
        .slice(0, 7);
    }
    
    // Determine document type based on content
    const documentType = context.documentType || 'Document';
    const wordCount = truncatedContent.split(/\s+/).length;

    console.log('🔑 Key Terms Analysis completed:', { keyTermsCount: keyTerms.length, wordCount });

    return {
      keyTerms,
      documentType,
      wordCount,
      disclaimer: 'This analysis is provided by AI and should be reviewed by qualified professionals for accuracy and completeness.'
    };
    
  } catch (error) {
    console.error('OpenAI API error in key terms analysis:', error);
    throw new Error(`Key terms analysis failed: ${error.message}`);
  }
}
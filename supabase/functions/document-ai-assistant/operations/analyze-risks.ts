import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

export async function handleAnalyzeRisks(content: string, context: any, openai: any): Promise<any> {
  console.log('⚠️ Risk Analysis starting with context:', context);
  
  let documentContent = content;
  
  // If no content provided, fetch using content retrieval function
  if (!documentContent) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
      // First try using the document-content-retrieval function
      if (context.documentVersionId && context.dealId) {
        console.log('🔍 Calling document-content-retrieval for risks analysis');
        const { data: contentResult, error: contentError } = await supabase.functions
          .invoke('document-content-retrieval', {
            body: {
              versionId: context.documentVersionId,
              dealId: context.dealId
            }
          });

        if (!contentError && contentResult?.content) {
          documentContent = contentResult.content;
          console.log('📄 Got content from content retrieval function');
        } else {
          console.error('❌ Error from content retrieval function:', contentError);
        }
      }
      
      // Fallback to direct database query if content retrieval fails
      if (!documentContent && context.documentVersionId) {
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
      
      // Second fallback to contracts table
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
      risks: ['Unable to analyze - document content not found'],
      disclaimer: 'This analysis is provided by AI and should be reviewed by qualified professionals for accuracy and completeness.'
    };
  }
  
  // Truncate content to stay within token limits (approximately 12,000 tokens for GPT-4o-mini)
  const maxLength = 48000; // Roughly 12k tokens in characters
  const truncatedContent = documentContent.length > maxLength 
    ? documentContent.substring(0, maxLength) + "..."
    : documentContent;

  try {
    // Generate concise risk analysis using OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a legal risk analyst. Identify ONLY the most significant risks in contracts.

CRITICAL INSTRUCTIONS:
- Return EXACTLY 3-5 risks maximum (or "No significant risks identified" if none found)
- Each risk should be 5-12 words maximum (e.g., "Missing termination clause for buyer protection")
- Focus only on HIGH-IMPACT legal, financial, or operational risks
- NO detailed explanations, NO low-impact issues
- Be concise and specific

Examples of good risks: ["Missing indemnification protection", "Unclear payment terms and deadlines", "No dispute resolution mechanism"]
Examples of bad risks: ["The contract contains complex language that may be difficult to understand for some parties"]`
        },
        {
          role: 'user',
          content: `Identify the most significant risks in this document:\n\n${truncatedContent}`
        }
      ],
      temperature: 0.2, // Low temperature for focused output
      max_tokens: 300   // Limit response length
    });

    const responseText = response.choices[0]?.message?.content || '';
    
    let risks = [];
    
    // Check for no risks response
    if (responseText.toLowerCase().includes('no significant risks') || 
        responseText.toLowerCase().includes('no major risks') ||
        responseText.toLowerCase().includes('minimal risk')) {
      risks = [];
    } else {
      // Parse risks from response
      risks = responseText
        .split(/[\n•\-*]/)
        .map(risk => risk.trim())
        .filter(risk => risk.length > 10 && risk.length < 100) // Filter meaningful risks
        .slice(0, 5); // Limit to 5 risks max
    }
    
    // Determine document type based on content
    const documentType = context.documentType || 'Document';
    const wordCount = truncatedContent.split(/\s+/).length;

    console.log('⚠️ Risk Analysis completed:', { risksCount: risks.length, wordCount });

    return {
      risks,
      documentType,
      wordCount,
      disclaimer: 'This analysis is provided by AI and should be reviewed by qualified professionals for accuracy and completeness.'
    };
    
  } catch (error) {
    console.error('OpenAI API error in risk analysis:', error);
    throw new Error(`Risk analysis failed: ${error.message}`);
  }
}
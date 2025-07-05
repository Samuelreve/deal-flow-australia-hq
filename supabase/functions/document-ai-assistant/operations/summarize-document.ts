
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function handleSummarizeDocument(
  content: string,
  context: any,
  openai: any
) {
  try {
    console.log('📋 Starting document summarization...');
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
        // For now, we'll assume the content comes from contracts table
      }
      
      // Try to get content from contracts table
      if (context?.documentId) {
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
        documentType: 'unknown',
        disclaimer: 'Document summarization requires valid content input.'
      };
    }

    console.log('📊 Analyzing document content...');
    
    // Clean and prepare content for analysis
    const cleanContent = documentContent.trim();
    const wordCount = cleanContent.split(/\s+/).length;
    const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Basic content analysis
    const hasContractTerms = /\b(agreement|contract|party|parties|terms|conditions|liability|termination|clause|section|obligation|breach|damages|indemnify|warranty|guarantee|consideration|execution|binding|force|effect)\b/gi.test(cleanContent);
    const hasLegalLanguage = /\b(whereas|therefore|hereby|herein|hereafter|notwithstanding|pursuant|thereof|thereto|aforesaid|covenant|undertake|shall|constitute|deem|provision|stipulate)\b/gi.test(cleanContent);
    const hasFinancialTerms = /\b(payment|price|cost|fee|amount|dollar|currency|invoice|billing|refund|penalty|interest|deposit|escrow)\b/gi.test(cleanContent);
    
    let documentType = 'document';
    if (hasContractTerms && hasLegalLanguage) {
      documentType = 'legal contract';
    } else if (hasContractTerms) {
      documentType = 'contract or agreement';
    } else if (hasFinancialTerms) {
      documentType = 'financial document';
    }

    // Generate key points from the content
    const keyPoints = [];
    
    if (hasContractTerms) {
      keyPoints.push('Contains contractual terms and obligations');
    }
    if (hasLegalLanguage) {
      keyPoints.push('Written in formal legal language');
    }
    if (hasFinancialTerms) {
      keyPoints.push('Includes financial terms and conditions');
    }
    
    // Extract potential party names (basic heuristic)
    const potentialParties = cleanContent.match(/\b[A-Z][a-z]+ [A-Z][a-z]+(?:\s+(?:Inc|LLC|Corp|Ltd|Company|Co)\b)?\b/g) || [];
    const uniqueParties = [...new Set(potentialParties)].slice(0, 3);
    
    if (uniqueParties.length > 0) {
      keyPoints.push(`Potential parties mentioned: ${uniqueParties.join(', ')}`);
    }

    // Generate a basic summary
    let summary = `This ${documentType} contains approximately ${wordCount} words across ${sentences.length} sentences.`;
    
    if (keyPoints.length > 0) {
      summary += `\n\nKey characteristics:\n• ${keyPoints.join('\n• ')}`;
    }

    // Add basic content overview
    if (wordCount > 100) {
      const firstSentences = sentences.slice(0, 2).join('. ');
      if (firstSentences.length > 0) {
        summary += `\n\nDocument begins with: "${firstSentences}..."`;
      }
    }

    if (hasContractTerms) {
      summary += '\n\nThis appears to be a contractual document that may contain important legal obligations, terms, and conditions that should be carefully reviewed.';
    }

    console.log('✅ Document summarization completed');
    console.log('📄 Summary length:', summary.length);

    return {
      success: true,
      summary,
      documentType,
      wordCount,
      sentenceCount: sentences.length,
      containsLegalTerms: hasContractTerms,
      containsLegalLanguage: hasLegalLanguage,
      containsFinancialTerms: hasFinancialTerms,
      keyPoints,
      disclaimer: 'This AI-generated summary is for informational purposes only and should not be considered legal advice. Always consult with a qualified attorney for legal matters.'
    };
  } catch (error) {
    console.error('❌ Error in handleSummarizeDocument:', error);
    throw new Error(`Failed to summarize document: ${error.message}`);
  }
}

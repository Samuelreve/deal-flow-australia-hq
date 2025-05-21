
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders, 
      status: 204 
    });
  }
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const openAIKey = Deno.env.get('OPENAI_API_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { operation, currentVersionId, previousVersionId, dealId } = await req.json();
    
    if (!operation || !currentVersionId || !previousVersionId || !dealId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }), 
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Verify document versions belong to the deal
    const currentVersionValid = await verifyVersionBelongsToDeal(supabase, currentVersionId, dealId);
    const previousVersionValid = await verifyVersionBelongsToDeal(supabase, previousVersionId, dealId);
    
    if (!currentVersionValid || !previousVersionValid) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to document versions' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Process based on operation type
    if (operation === 'compare') {
      // Fetch document content for both versions
      const currentVersionContent = await getDocumentContent(supabase, dealId, currentVersionId);
      const previousVersionContent = await getDocumentContent(supabase, dealId, previousVersionId);
      
      // Compare the versions
      const comparisonResult = compareVersions(currentVersionContent, previousVersionContent);
      
      return new Response(
        JSON.stringify({ result: comparisonResult }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else if (operation === 'summarize_changes') {
      if (!openAIKey) {
        return new Response(
          JSON.stringify({ error: 'OpenAI API key not configured' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Fetch document content for both versions
      const currentVersionContent = await getDocumentContent(supabase, dealId, currentVersionId);
      const previousVersionContent = await getDocumentContent(supabase, dealId, previousVersionId);
      
      // Get AI summary of changes
      const summary = await getAISummaryOfChanges(
        currentVersionContent, 
        previousVersionContent, 
        openAIKey
      );
      
      return new Response(
        JSON.stringify({
          summary: summary.summary,
          disclaimer: summary.disclaimer
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid operation' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Error in document-version-operations function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * Verify that a document version belongs to a specific deal
 */
async function verifyVersionBelongsToDeal(supabase: any, versionId: string, dealId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('document_versions')
    .select('document_id')
    .eq('id', versionId)
    .single();
  
  if (error || !data) {
    return false;
  }
  
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('deal_id')
    .eq('id', data.document_id)
    .single();
  
  if (docError || !document) {
    return false;
  }
  
  return document.deal_id === dealId;
}

/**
 * Get the content of a document version
 */
async function getDocumentContent(supabase: any, dealId: string, versionId: string): Promise<string> {
  try {
    // Get version details
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select('storage_path, document_id')
      .eq('id', versionId)
      .single();
    
    if (versionError || !version) {
      throw new Error('Document version not found');
    }
    
    // Create a signed URL to download the file
    const { data: urlData, error: urlError } = await supabase.storage
      .from('deal-documents')
      .createSignedUrl(`${dealId}/${version.storage_path}`, 60);
    
    if (urlError || !urlData?.signedUrl) {
      throw new Error('Failed to create signed URL');
    }
    
    // Download the file content
    const response = await fetch(urlData.signedUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    // For simplicity, we're treating all files as text
    // In a production environment, you would handle different file types (PDF, DOCX, etc.)
    const content = await response.text();
    return content;
  } catch (error) {
    console.error('Error retrieving document content:', error);
    return '';
  }
}

/**
 * Compare two document versions
 */
function compareVersions(currentContent: string, previousContent: string) {
  if (!currentContent && !previousContent) {
    return {
      additions: [],
      deletions: [],
      unchanged: [],
      differenceSummary: 'Both versions are empty.'
    };
  }
  
  if (!previousContent) {
    return {
      additions: [currentContent],
      deletions: [],
      unchanged: [],
      differenceSummary: 'This is the first version of the document.'
    };
  }
  
  if (!currentContent) {
    return {
      additions: [],
      deletions: [previousContent],
      unchanged: [],
      differenceSummary: 'The current version is empty.'
    };
  }
  
  // Split content into paragraphs for comparison
  const currentLines = currentContent.split(/\n\s*\n/).filter(line => line.trim());
  const previousLines = previousContent.split(/\n\s*\n/).filter(line => line.trim());
  
  const additions = currentLines.filter(line => !previousLines.includes(line));
  const deletions = previousLines.filter(line => !currentLines.includes(line));
  const unchanged = currentLines.filter(line => previousLines.includes(line));
  
  let differenceSummary = '';
  if (additions.length === 0 && deletions.length === 0) {
    differenceSummary = 'No significant changes detected between versions.';
  } else {
    differenceSummary = `Found ${additions.length} additions and ${deletions.length} deletions.`;
  }
  
  return {
    additions,
    deletions,
    unchanged,
    differenceSummary
  };
}

/**
 * Get AI summary of changes between two document versions
 */
async function getAISummaryOfChanges(
  currentContent: string, 
  previousContent: string, 
  apiKey: string
): Promise<{ summary: string; disclaimer: string }> {
  try {
    // Prepare the content for OpenAI
    // Truncate very long documents to fit token limits
    const maxContentLength = 10000;
    const truncatedPrevious = previousContent.length > maxContentLength 
      ? previousContent.substring(0, maxContentLength) + "... [CONTENT TRUNCATED]" 
      : previousContent;
    
    const truncatedCurrent = currentContent.length > maxContentLength 
      ? currentContent.substring(0, maxContentLength) + "... [CONTENT TRUNCATED]" 
      : currentContent;

    // Create prompt for OpenAI
    const prompt = `You are a legal document comparison assistant. Your task is to summarize the key changes and differences between two versions of a document. Focus on significant additions, deletions, or modifications to clauses, terms, or obligations.

Previous Document Version Content:
${truncatedPrevious}

---

Current Document Version Content:
${truncatedCurrent}

---

Provide a concise summary of the changes in bullet points. Highlight any new risks, significant altered obligations, or important new clauses.

Important Rules:
1. Base your summary ONLY on the provided text. Do not invent information.
2. Be concise and professional.
3. Do NOT provide legal or financial advice.
4. If no significant changes are detected, state 'No significant changes detected.'`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI document comparison assistant specializing in legal and business documents.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const responseData = await response.json();
    const summary = responseData.choices[0]?.message?.content || 'Failed to generate summary';

    return {
      summary,
      disclaimer: "This AI-generated summary is provided for informational purposes only and should not be considered legal advice. Always consult with a qualified legal professional for interpretation of legal documents."
    };
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return {
      summary: `Failed to generate AI summary: ${error.message}`,
      disclaimer: "Error occurred during analysis."
    };
  }
}

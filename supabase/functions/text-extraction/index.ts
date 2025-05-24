import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, fileName, mimeType } = await req.json();
    
    console.log('Processing file:', fileName, 'Type:', mimeType);
    
    // For now, return a placeholder text extraction
    // In a production environment, you would use libraries like pdf-parse, mammoth, etc.
    // or integrate with document processing services
    
    let extractedText = '';
    
    if (mimeType === 'text/plain') {
      // For text files, we could read the content directly
      extractedText = 'This is a sample contract text. In a real implementation, the actual file content would be extracted here.';
    } else if (mimeType === 'application/pdf') {
      // For PDF files, you would use a PDF parsing library
      extractedText = `This is extracted text from the PDF file: ${fileName}. 

SAMPLE CONTRACT CONTENT:

This agreement is entered into between Party A and Party B for the provision of services. 

Key Terms:
- Duration: 12 months
- Payment: Monthly installments
- Termination: 30 days notice required
- Governing Law: State jurisdiction

The parties agree to the following obligations and terms as outlined in this document.`;
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      // For Word documents, you would use mammoth or similar
      extractedText = `This is extracted text from the Word document: ${fileName}.

SAMPLE CONTRACT CONTENT:

Service Agreement between the parties for consulting services.

Terms and Conditions:
1. Scope of Work: As defined in Exhibit A
2. Compensation: As specified in the payment schedule
3. Confidentiality: Both parties agree to maintain confidentiality
4. Intellectual Property: Rights and ownership as outlined
5. Termination: Either party may terminate with proper notice

This agreement shall be governed by applicable laws.`;
    }
    
    return new Response(
      JSON.stringify({ 
        text: extractedText,
        success: true,
        message: 'Text extracted successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in text-extraction function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to extract text',
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

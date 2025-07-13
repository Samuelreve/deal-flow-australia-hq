import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.0.0";
import mammoth from "https://esm.sh/mammoth@1.6.0";
import JSZip from "https://esm.sh/jszip@3.10.1";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';

interface AnalysisRequest {
  documentId: string;
  documentVersionId: string;
  dealId: string;
  userId: string;
  analysisType: 'key_terms' | 'risks' | 'summary';
  forceOCR?: boolean;
}

interface AnalysisResult {
  success: boolean;
  analysisType: string;
  keyTerms?: string[];
  risks?: string[];
  summary?: string;
  documentType?: string;
  wordCount?: number;
  extractionMethod?: string;
  disclaimer?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const requestData: AnalysisRequest = await req.json();
    
    console.log('🔍 Enhanced Document Analyzer - Request:', {
      documentId: requestData.documentId,
      documentVersionId: requestData.documentVersionId,
      analysisType: requestData.analysisType,
      forceOCR: requestData.forceOCR || false
    });

    // Validate required fields
    if (!requestData.documentId || !requestData.documentVersionId || !requestData.analysisType) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: documentId, documentVersionId, or analysisType' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate API keys
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OpenAI API key not configured' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize services
    const supabase = createClient(supabaseUrl, supabaseKey);
    const openai = new OpenAI({ apiKey: openAIApiKey });

    // Perform comprehensive document analysis
    const analysisResult = await analyzeDocumentComprehensive(
      requestData,
      supabase,
      openai
    );

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Enhanced Document Analyzer error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Comprehensive document analysis with OCR integration
 */
async function analyzeDocumentComprehensive(
  request: AnalysisRequest,
  supabase: any,
  openai: any
): Promise<AnalysisResult> {
  try {
    console.log('📋 Starting comprehensive document analysis...');

    // Step 1: Get document and version metadata
    const { document, documentVersion } = await getDocumentMetadata(
      request.documentId,
      request.documentVersionId,
      supabase
    );

    // Step 2: Extract text with OCR fallback
    const extractionResult = await extractTextWithOCRFallback(
      document,
      documentVersion,
      request.dealId,
      request.forceOCR || false,
      supabase
    );

    if (!extractionResult.success) {
      return {
        success: false,
        analysisType: request.analysisType,
        error: extractionResult.error || 'Text extraction failed'
      };
    }

    // Step 3: Perform AI analysis based on type
    const analysisResult = await performAIAnalysis(
      extractionResult.text!,
      request.analysisType,
      document,
      openai
    );

    return {
      success: true,
      analysisType: request.analysisType,
      ...analysisResult,
      extractionMethod: extractionResult.method,
      wordCount: extractionResult.text!.split(/\s+/).length,
      disclaimer: 'This AI-generated analysis is for informational purposes only and should be reviewed by qualified professionals.'
    };

  } catch (error) {
    console.error('❌ Comprehensive analysis error:', error);
    return {
      success: false,
      analysisType: request.analysisType,
      error: error instanceof Error ? error.message : 'Analysis failed'
    };
  }
}

/**
 * Get document and version metadata from database
 */
async function getDocumentMetadata(
  documentId: string,
  documentVersionId: string,
  supabase: any
): Promise<{ document: any; documentVersion: any }> {
  
  // Get document information
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (docError || !document) {
    throw new Error(`Document not found: ${docError?.message || 'Unknown error'}`);
  }

  // Get document version information
  const { data: documentVersion, error: versionError } = await supabase
    .from('document_versions')
    .select('*')
    .eq('id', documentVersionId)
    .single();

  if (versionError || !documentVersion) {
    throw new Error(`Document version not found: ${versionError?.message || 'Unknown error'}`);
  }

  console.log('📄 Document metadata retrieved:', {
    name: document.name,
    type: document.type,
    hasTextContent: !!documentVersion.text_content,
    textContentLength: documentVersion.text_content?.length || 0
  });

  return { document, documentVersion };
}

/**
 * Extract text with comprehensive OCR fallback strategy
 */
async function extractTextWithOCRFallback(
  document: any,
  documentVersion: any,
  dealId: string,
  forceOCR: boolean,
  supabase: any
): Promise<{ success: boolean; text?: string; method?: string; error?: string }> {
  
  let extractedText = '';
  let extractionMethod = '';

  // Strategy 1: Use existing text content if available and not forcing OCR
  if (!forceOCR && documentVersion.text_content && documentVersion.text_content.trim().length > 50) {
    console.log('📄 Using existing text content from database');
    extractedText = documentVersion.text_content;
    extractionMethod = 'database_text_content';
  } 
  // Strategy 2: Download and extract using standard methods
  else {
    console.log('📥 Downloading document from storage for extraction...');
    
    // Download file from storage
    const fileData = await downloadDocumentFromStorage(document, documentVersion, dealId, supabase);
    
    if (!fileData) {
      return { success: false, error: 'Failed to download document from storage' };
    }

    // Determine file type
    const mimeType = document.type || 'application/octet-stream';
    const fileName = document.name || 'document';
    
    console.log('📋 File details:', { fileName, mimeType, size: fileData.size });

    // Try standard text extraction first
    try {
      const standardResult = await extractTextStandard(fileData, mimeType, fileName);
      if (standardResult.success && standardResult.text && standardResult.text.trim().length > 50) {
        extractedText = standardResult.text;
        extractionMethod = standardResult.method || 'standard_extraction';
        console.log('✅ Standard text extraction successful');
      } else {
        throw new Error('Standard extraction returned insufficient text');
      }
    } catch (standardError) {
      console.warn('⚠️ Standard extraction failed:', standardError.message);
      
      // Strategy 3: Use OCR as fallback
      if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
        console.log('🔍 Attempting OCR extraction as fallback...');
        
        try {
          const ocrResult = await extractTextWithOCR(fileData, fileName);
          if (ocrResult.success && ocrResult.text && ocrResult.text.trim().length > 50) {
            extractedText = ocrResult.text;
            extractionMethod = 'ocr_extraction';
            console.log('✅ OCR extraction successful');
          } else {
            throw new Error('OCR extraction returned insufficient text');
          }
        } catch (ocrError) {
          console.error('❌ OCR extraction failed:', ocrError.message);
          return { 
            success: false, 
            error: `Both standard and OCR extraction failed. Standard: ${standardError.message}. OCR: ${ocrError.message}` 
          };
        }
      } else {
        return { 
          success: false, 
          error: `Standard extraction failed for ${mimeType}: ${standardError.message}` 
        };
      }
    }
  }

  // Validate extracted text
  if (!extractedText || extractedText.trim().length < 20) {
    return { 
      success: false, 
      error: 'Extracted text is too short or empty' 
    };
  }

  // Clean and prepare text
  const cleanedText = cleanExtractedText(extractedText);
  
  console.log('✅ Text extraction completed:', {
    method: extractionMethod,
    originalLength: extractedText.length,
    cleanedLength: cleanedText.length
  });

  return {
    success: true,
    text: cleanedText,
    method: extractionMethod
  };
}

/**
 * Download document from Supabase storage
 */
async function downloadDocumentFromStorage(
  document: any,
  documentVersion: any,
  dealId: string,
  supabase: any
): Promise<Blob | null> {
  
  const bucketName = 'deal_documents';
  const storagePath = `${dealId}/${documentVersion.storage_path}`;
  
  console.log('📥 Downloading from storage:', { bucketName, storagePath });

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(storagePath);

    if (error) {
      console.error('❌ Storage download error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Storage download failed:', error);
    return null;
  }
}

/**
 * Standard text extraction for supported file types
 */
async function extractTextStandard(
  fileData: Blob,
  mimeType: string,
  fileName: string
): Promise<{ success: boolean; text?: string; method?: string; error?: string }> {
  
  const fileBuffer = await fileData.arrayBuffer();
  
  try {
    if (mimeType === 'text/plain' || fileName.toLowerCase().endsWith('.txt')) {
      const text = new TextDecoder('utf-8').decode(fileBuffer);
      return { success: true, text, method: 'plain_text' };
    }
    
    else if (mimeType === 'application/rtf' || fileName.toLowerCase().endsWith('.rtf')) {
      const text = new TextDecoder('utf-8').decode(fileBuffer);
      const cleanedText = text.replace(/\\[a-z0-9]+(\s|-?\d+)?/gi, '').replace(/[{}]/g, '').trim();
      return { success: true, text: cleanedText, method: 'rtf_extraction' };
    }
    
    else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
             fileName.toLowerCase().endsWith('.docx')) {
      const result = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
      return { success: true, text: result.value, method: 'docx_extraction' };
    }
    
    else if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      // Try multiple PDF extraction methods
      const pdfResult = await extractPDFTextMultiStrategy(fileBuffer);
      return pdfResult;
    }
    
    else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Standard extraction failed' 
    };
  }
}

/**
 * Multi-strategy PDF text extraction
 */
async function extractPDFTextMultiStrategy(fileBuffer: ArrayBuffer): Promise<{ success: boolean; text?: string; method?: string; error?: string }> {
  
  // Strategy 1: Try unpdf
  try {
    const { extractText } = await import("https://esm.sh/unpdf@0.11.0");
    const result = await extractText(new Uint8Array(fileBuffer));
    
    let extractedText = '';
    if (typeof result === 'string') {
      extractedText = result;
    } else if (result && typeof result === 'object' && 'text' in result) {
      extractedText = String(result.text || '');
    } else {
      extractedText = String(result || '');
    }
    
    // Validate extracted text quality
    if (extractedText && extractedText.trim().length > 50 && isValidPDFText(extractedText)) {
      return { success: true, text: extractedText, method: 'unpdf_extraction' };
    }
  } catch (unpdfError) {
    console.warn('⚠️ unpdf extraction failed:', unpdfError);
  }

  // Strategy 2: Try pdf-parse
  try {
    const pdfParse = await import("https://esm.sh/pdf-parse@1.1.1");
    const result = await pdfParse.default(fileBuffer);
    
    if (result.text && result.text.trim().length > 50 && isValidPDFText(result.text)) {
      return { success: true, text: result.text, method: 'pdf_parse_extraction' };
    }
  } catch (pdfParseError) {
    console.warn('⚠️ pdf-parse extraction failed:', pdfParseError);
  }

  return { success: false, error: 'All PDF extraction strategies failed' };
}

/**
 * Validate if extracted PDF text is actual content (not PDF internals)
 */
function isValidPDFText(text: string): boolean {
  // Check for PDF internal markers that indicate bad extraction
  const badMarkers = [
    'endstreamendobj',
    'endstream',
    'xpacket',
    'Filter/Flate',
    'obj',
    'endobj',
    'stream',
    'xref',
    'trailer'
  ];
  
  const lowerText = text.toLowerCase();
  
  // If it contains too many bad markers, it's probably PDF internals
  const badMarkerCount = badMarkers.filter(marker => lowerText.includes(marker.toLowerCase())).length;
  if (badMarkerCount > 2) {
    return false;
  }

  // Check if it has meaningful word-like content
  const words = text.split(/\s+/).filter(word => word.length > 2);
  const meaningfulWords = words.filter(word => /^[a-zA-Z][a-zA-Z0-9]*$/.test(word));
  
  return meaningfulWords.length > words.length * 0.3; // At least 30% should be meaningful words
}

/**
 * OCR text extraction using the existing OCR service
 */
async function extractTextWithOCR(
  fileData: Blob,
  fileName: string
): Promise<{ success: boolean; text?: string; error?: string }> {
  
  try {
    console.log('🔍 Starting OCR text extraction...');
    
    // Convert file to base64
    const fileBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(fileBuffer);
    
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    const base64 = btoa(binary);
    
    // Call the OCR service
    const ocrResponse = await fetch(`${supabaseUrl}/functions/v1/text-extractor-ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        fileBase64: base64,
        mimeType: fileData.type || 'application/pdf',
        fileName: fileName
      })
    });

    if (!ocrResponse.ok) {
      throw new Error(`OCR service error: ${ocrResponse.status} ${ocrResponse.statusText}`);
    }

    const ocrResult = await ocrResponse.json();
    
    if (!ocrResult.success) {
      throw new Error(ocrResult.error || 'OCR extraction failed');
    }

    return { 
      success: true, 
      text: ocrResult.text 
    };

  } catch (error) {
    console.error('❌ OCR extraction error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'OCR extraction failed' 
    };
  }
}

/**
 * Clean and prepare extracted text for analysis
 */
function cleanExtractedText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    // Remove page numbers and headers/footers patterns
    .replace(/Page \d+ of \d+/gi, '')
    .replace(/^\s*\d+\s*$/gm, '')
    // Trim each line
    .replace(/^\s+|\s+$/gm, '')
    // Final cleanup
    .trim();
}

/**
 * Perform AI analysis based on the requested type
 */
async function performAIAnalysis(
  text: string,
  analysisType: string,
  document: any,
  openai: any
): Promise<{ keyTerms?: string[]; risks?: string[]; summary?: string; documentType?: string }> {
  
  // Truncate text if too long for API
  const maxLength = 12000;
  const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  
  const documentType = determineDocumentType(document, text);
  
  console.log('🤖 Starting AI analysis:', { 
    analysisType, 
    documentType, 
    textLength: truncatedText.length 
  });

  try {
    switch (analysisType) {
      case 'key_terms':
        return await analyzeKeyTerms(truncatedText, documentType, openai);
      
      case 'risks':
        return await analyzeRisks(truncatedText, documentType, openai);
      
      case 'summary':
        return await analyzeSummary(truncatedText, documentType, openai);
      
      default:
        throw new Error(`Unsupported analysis type: ${analysisType}`);
    }
  } catch (error) {
    console.error('❌ AI analysis error:', error);
    throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Determine document type based on filename and content
 */
function determineDocumentType(document: any, text: string): string {
  const fileName = document.name?.toLowerCase() || '';
  const lowerText = text.toLowerCase();
  
  // Check filename first
  if (fileName.includes('contract') || fileName.includes('agreement')) {
    return 'Contract';
  }
  if (fileName.includes('nda') || fileName.includes('non-disclosure')) {
    return 'Non-Disclosure Agreement';
  }
  if (fileName.includes('lease') || fileName.includes('rental')) {
    return 'Lease Agreement';
  }
  
  // Check content
  if (lowerText.includes('non-disclosure') || lowerText.includes('confidential')) {
    return 'Non-Disclosure Agreement';
  }
  if (lowerText.includes('employment') || lowerText.includes('employee')) {
    return 'Employment Agreement';
  }
  if (lowerText.includes('lease') || lowerText.includes('rental')) {
    return 'Lease Agreement';
  }
  if (lowerText.includes('purchase') || lowerText.includes('sale')) {
    return 'Purchase Agreement';
  }
  if (lowerText.includes('service') || lowerText.includes('services')) {
    return 'Service Agreement';
  }
  
  return 'Legal Document';
}

/**
 * Analyze key terms using AI
 */
async function analyzeKeyTerms(text: string, documentType: string, openai: any): Promise<{ keyTerms: string[]; documentType: string }> {
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a legal document analyst. Extract the most important key terms from contracts and legal documents.

INSTRUCTIONS:
- Return exactly 5-8 key terms maximum
- Each term should be 1-4 words (e.g., "Purchase Price", "Closing Date", "Liability Cap")
- Focus on the most essential legal and business terms
- Return as a JSON array of strings
- NO explanations, NO descriptions

Examples: ["Purchase Price", "Closing Date", "Representations", "Indemnification", "Termination"]`
      },
      {
        role: 'user',
        content: `Extract key terms from this ${documentType}:\n\n${text}`
      }
    ],
    temperature: 0.1,
    max_tokens: 300
  });

  const responseText = response.choices[0]?.message?.content || '';
  
  try {
    // Try to parse as JSON
    const keyTerms = JSON.parse(responseText.replace(/```json|```/g, ''));
    
    if (Array.isArray(keyTerms)) {
      return { 
        keyTerms: keyTerms.slice(0, 8).map(term => String(term).trim()), 
        documentType 
      };
    }
  } catch (parseError) {
    console.warn('⚠️ Failed to parse key terms as JSON, falling back to text parsing');
  }

  // Fallback: parse as text
  const keyTerms = responseText
    .split(/[\n,]/)
    .map(term => term.trim().replace(/['"]/g, '').replace(/^\d+\.\s*/, ''))
    .filter(term => term.length > 0 && term.length < 50)
    .slice(0, 8);

  return { keyTerms, documentType };
}

/**
 * Analyze risks using AI
 */
async function analyzeRisks(text: string, documentType: string, openai: any): Promise<{ risks: string[]; documentType: string }> {
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a legal risk analyst. Identify the most significant risks in contracts and legal documents.

INSTRUCTIONS:
- Return exactly 3-6 risks maximum
- Each risk should be 5-15 words (e.g., "Missing termination clause creates indefinite commitment")
- Focus on HIGH-IMPACT legal, financial, or operational risks
- Return as a JSON array of strings
- NO explanations, NO low-impact issues

Examples: ["Missing indemnification protection", "Unclear payment terms and deadlines", "No dispute resolution mechanism"]`
      },
      {
        role: 'user',
        content: `Identify significant risks in this ${documentType}:\n\n${text}`
      }
    ],
    temperature: 0.2,
    max_tokens: 400
  });

  const responseText = response.choices[0]?.message?.content || '';
  
  try {
    // Try to parse as JSON
    const risks = JSON.parse(responseText.replace(/```json|```/g, ''));
    
    if (Array.isArray(risks)) {
      return { 
        risks: risks.slice(0, 6).map(risk => String(risk).trim()), 
        documentType 
      };
    }
  } catch (parseError) {
    console.warn('⚠️ Failed to parse risks as JSON, falling back to text parsing');
  }

  // Fallback: parse as text
  const risks = responseText
    .split(/[\n•\-*]/)
    .map(risk => risk.trim().replace(/^\d+\.\s*/, ''))
    .filter(risk => risk.length > 10 && risk.length < 200)
    .slice(0, 6);

  return { risks, documentType };
}

/**
 * Analyze summary using AI
 */
async function analyzeSummary(text: string, documentType: string, openai: any): Promise<{ summary: string; documentType: string }> {
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a legal document analyst. Provide concise, professional summaries of contracts and legal documents.

INSTRUCTIONS:
- Write a comprehensive summary in 3-5 sentences
- Focus on: main purpose, key parties, important terms, and obligations
- Use clear, professional language
- Be specific about key details like amounts, dates, and conditions`
      },
      {
        role: 'user',
        content: `Provide a summary of this ${documentType}:\n\n${text}`
      }
    ],
    temperature: 0.3,
    max_tokens: 500
  });

  const summary = response.choices[0]?.message?.content || 'Summary not available';
  
  return { summary, documentType };
} 
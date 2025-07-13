import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

/**
 * Extract text using OCR (Optical Character Recognition) for all document types
 */
async function extractTextWithOCR(fileData: Blob, fileName: string): Promise<string> {
  console.log('Starting OCR extraction for:', fileName);
  
  try {
    // Convert Blob to base64
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
    const response = await fetch(`${supabaseUrl}/functions/v1/text-extractor`, {
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
    
    if (!response.ok) {
      throw new Error(`OCR service responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'OCR extraction failed');
    }
    
    console.log('OCR extraction completed successfully');
    console.log('Extracted text length:', result.text?.length || 0);
    console.log('Pages processed:', result.pageCount || 'unknown');
    
    return result.text || '';
  } catch (error) {
    console.error('OCR extraction error:', error);
    throw new Error(`OCR failed: ${error.message}`);
  }
}

async function analyzeDocumentWithAI(text: string, analysisType: string, openai: any): Promise<any> {
  const prompts = {
    'summary': `Please provide a concise summary of this document in exactly 3-4 sentences. Focus on the main purpose, key parties involved, and most important terms. Keep it brief and professional. Document content:\n\n${text}`,
    'key_terms': `Extract and list the key terms, important clauses, and significant provisions from this document. Return them as a simple list. Document content:\n\n${text}`,
    'risks': `Identify potential risks, concerns, or red flags in this document. Focus on legal, financial, and operational risks. Document content:\n\n${text}`
  };

  const prompt = prompts[analysisType] || `Analyze this document for: ${analysisType}\n\nDocument content:\n\n${text}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a legal document analysis AI. Provide clear, concise, and professional analysis. Be specific and actionable in your responses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    const analysis = response.choices[0].message.content;

    // Structure the response based on analysis type
    switch (analysisType) {
      case 'summary':
        return {
          summary: analysis,
          keyPoints: analysis.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•')).slice(0, 5)
        };
      case 'key_terms':
        // Extract terms from the AI response
        const terms = analysis.split('\n')
          .filter(line => line.trim() && (line.includes('-') || line.includes('•') || line.includes(':')))
          .map(line => line.replace(/^[-•\s]*/, '').replace(/:.*$/, '').trim())
          .filter(term => term.length > 0)
          .slice(0, 10);
        return { keyTerms: terms };
      case 'risks':
        // Extract risks from the AI response
        const risks = analysis.split('\n')
          .filter(line => line.trim() && (line.includes('-') || line.includes('•')))
          .map(line => line.replace(/^[-•\s]*/, '').trim())
          .filter(risk => risk.length > 0)
          .slice(0, 8);
        return { risks: risks };
      default:
        return { analysis };
    }
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

export async function handleAnalyzeDocument(
  documentId: string,
  documentVersionId: string,
  analysisType: string,
  openai: any,
  documentText?: string
) {
  console.log('Starting OCR-based document analysis:', { 
    documentId, 
    documentVersionId, 
    analysisType,
    hasProvidedText: !!documentText,
    providedTextLength: documentText?.length || 0
  });
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get document information from database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      console.error('Document not found:', docError);
      throw new Error('Document not found in database');
    }

    // Get document version information for the correct storage path
    const { data: documentVersion, error: versionError } = await supabase
      .from('document_versions')
      .select('*')
      .eq('id', documentVersionId)
      .single();

    if (versionError || !documentVersion) {
      console.error('Document version not found:', versionError);
      throw new Error('Document version not found in database');
    }

    console.log('Found document for OCR analysis:', { 
      name: document.name, 
      type: document.type, 
      versionStoragePath: documentVersion.storage_path
    });

    let extractedText = '';
    
    // If we have document text provided, use it directly
    if (documentText && documentText.trim().length > 0) {
      console.log('Using provided document text, length:', documentText.length);
      extractedText = documentText;
    } else {
      console.log('No document text provided, using OCR extraction from storage...');
      
      // Download file from storage
      const storagePath = documentVersion.storage_path;
      let fullStoragePath: string;
      
      if (storagePath.startsWith(document.deal_id + '/') || storagePath.includes('/')) {
        fullStoragePath = storagePath;
      } else {
        fullStoragePath = `${document.deal_id}/${storagePath}`;
      }
      
      console.log('Storage path for OCR:', { originalStoragePath: storagePath, fullStoragePath });
      
      // Try to download from storage buckets
      let fileData = null;
      const buckets = ['deal_documents', 'deal-documents', 'Documents', 'contracts'];
      
      for (const bucket of buckets) {
        const { data, error } = await supabase.storage
          .from(bucket)
          .download(fullStoragePath);
        
        if (data && !error) {
          fileData = data;
          console.log(`Document downloaded from ${bucket} bucket for OCR`);
          break;
        }
      }

      if (!fileData) {
        throw new Error(`Failed to download document from storage. Path: ${fullStoragePath}`);
      }
      
      // Use OCR extraction for all documents
      console.log('Extracting text using OCR...');
      extractedText = await extractTextWithOCR(fileData, document.name);
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted via OCR');
      }

      console.log('OCR text extracted, length:', extractedText.length);
    }
    
    // Validate that we have text to analyze
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text content available for analysis');
    }

    console.log('Final text to analyze, length:', extractedText.length);

    // Analyze the extracted text with AI
    const analysisResult = await analyzeDocumentWithAI(extractedText, analysisType, openai);
    
    return {
      ...analysisResult,
      disclaimer: 'This analysis is provided by AI and should be reviewed by qualified professionals for accuracy and completeness.'
    };
  } catch (error) {
    console.error('Error in OCR-based document analysis:', error);
    throw new Error(`Failed to analyze document: ${error.message}`);
  }
}
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import mammoth from "https://esm.sh/mammoth@1.6.0";
import { extractText } from "https://esm.sh/unpdf@0.11.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

async function extractTextFromDocument(fileBuffer: ArrayBuffer, contentType: string, fileName: string): Promise<string> {
  try {
    console.log(`Extracting text from ${fileName} (${contentType}), buffer size: ${fileBuffer.byteLength}`);
    
    if (contentType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      // Extract text from PDF using unpdf
      try {
        const text = await extractText(new Uint8Array(fileBuffer));
        const textString = typeof text === 'string' ? text : String(text || '');
        console.log(`PDF text extracted, length: ${textString.length}`);
        return textString;
      } catch (pdfError) {
        console.error('PDF extraction failed:', pdfError);
        // Try alternative: decode as text if PDF parsing fails
        const fallbackText = new TextDecoder('utf-8', { ignoreBOM: true }).decode(fileBuffer);
        return fallbackText.replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
      }
    } else if (contentType.includes('officedocument.wordprocessingml') || fileName.toLowerCase().endsWith('.docx')) {
      // Extract text from DOCX using mammoth
      const result = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
      return result.value || '';
    } else if (contentType.includes('rtf') || fileName.toLowerCase().endsWith('.rtf')) {
      // Simple RTF text extraction
      const text = new TextDecoder().decode(fileBuffer);
      return text.replace(/\\[a-z0-9]+(\s|-?\d+)?/gi, '').replace(/[{}]/g, '').trim();
    } else if (contentType.includes('text/plain') || fileName.toLowerCase().endsWith('.txt')) {
      // Plain text
      return new TextDecoder().decode(fileBuffer);
    } else {
      throw new Error(`Unsupported file type: ${contentType}`);
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text from ${fileName}: ${error.message}`);
  }
}

async function analyzeDocumentWithAI(text: string, analysisType: string, openai: any): Promise<any> {
  const prompts = {
    'summary': `Please provide a comprehensive summary of this document. Focus on the main purpose, key parties involved, important terms, and overall structure. Document content:\n\n${text}`,
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
  console.log('Starting document analysis:', { 
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

    console.log('Found document:', { 
      name: document.name, 
      type: document.type, 
      documentStoragePath: document.storage_path,
      versionStoragePath: documentVersion.storage_path,
      textContentType: typeof documentVersion.text_content,
      textContentLength: documentVersion.text_content ? documentVersion.text_content.length : 0,
      textContentPreview: documentVersion.text_content ? String(documentVersion.text_content).substring(0, 100) : 'No text content'
    });

    let extractedText = '';
    
    // If we have document text provided, use it directly
    if (documentText && documentText.trim().length > 0) {
      console.log('Using provided document text, length:', documentText.length);
      extractedText = documentText;
    } else {
      console.log('No document text provided, attempting to download and extract from storage...');
      
      // Download file from storage - try multiple bucket names
      let fileData = null;
      let storageError = null;
    
    // Use the document version's storage path (not the document's storage path)
    // The storage_path needs to be prefixed with dealId like other functions do
    const storagePath = documentVersion.storage_path;
    
    // Check if storage path already includes deal ID (some inconsistency in database)
    let fullStoragePath: string;
    if (storagePath.startsWith(document.deal_id + '/') || storagePath.includes('/')) {
      // Path already contains deal ID or folder structure
      fullStoragePath = storagePath;
    } else {
      // Path is just filename, need to add deal ID prefix
      fullStoragePath = `${document.deal_id}/${storagePath}`;
    }
    
    console.log('Storage path analysis:', { 
      originalStoragePath: storagePath, 
      dealId: document.deal_id, 
      fullStoragePath: fullStoragePath 
    });
    
    // Try deal-documents bucket first (with hyphen - the correct one)
    const { data: fileData1, error: storageError1 } = await supabase.storage
      .from('deal-documents')
      .download(fullStoragePath);
    
    if (fileData1 && !storageError1) {
      fileData = fileData1;
    } else {
      console.log('deal-documents bucket failed, trying deal_documents bucket');
      // Try deal_documents bucket (with underscore - alternative)
      const { data: fileData2, error: storageError2 } = await supabase.storage
        .from('deal_documents')
        .download(fullStoragePath);
      
      if (fileData2 && !storageError2) {
        fileData = fileData2;
      } else {
        console.log('deal_documents bucket failed, trying Documents bucket');
        // Try Documents bucket
        const { data: fileData3, error: storageError3 } = await supabase.storage
          .from('Documents')
          .download(fullStoragePath);
        
        if (fileData3 && !storageError3) {
          fileData = fileData3;
        } else {
          console.log('Documents bucket failed, trying contracts bucket');
          // Try contracts bucket
          const { data: fileData4, error: storageError4 } = await supabase.storage
            .from('contracts')
            .download(fullStoragePath);
          
          if (fileData4 && !storageError4) {
            fileData = fileData4;
          } else {
            storageError = storageError4 || storageError3 || storageError2 || storageError1;
          }
        }
      }
    }

    if (!fileData) {
      console.error('All storage download attempts failed:', {
        'deal-documents': storageError1?.message || JSON.stringify(storageError1),
        'deal_documents': storageError2?.message || JSON.stringify(storageError2),
        'Documents': storageError3?.message || JSON.stringify(storageError3),
        'contracts': storageError4?.message || JSON.stringify(storageError4),
        finalError: storageError?.message || JSON.stringify(storageError),
        storagePath: storagePath,
        fullStoragePath: fullStoragePath,
        dealId: document.deal_id
      });
      throw new Error(`Failed to download document from storage. Tried multiple buckets. Storage path: ${storagePath}. Full path: ${fullStoragePath}. Last error: ${storageError?.message || JSON.stringify(storageError) || 'Unknown error'}`);
    }
    console.log(`Document downloaded successfully, processing with buffer size: ${fileData.size}`);
    
      // Extract text from the document
      const fileBuffer = await fileData.arrayBuffer();
      extractedText = await extractTextFromDocument(fileBuffer, document.type, document.name);
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from the document');
      }

      console.log('Text extracted from file, length:', extractedText.length);
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
    console.error('Error in handleAnalyzeDocument:', error);
    throw new Error(`Failed to analyze document: ${error.message}`);
  }
}

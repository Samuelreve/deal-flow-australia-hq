
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import mammoth from "https://esm.sh/mammoth@1.6.0";
import { extractText } from "https://esm.sh/unpdf@0.11.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

async function extractTextFromDocument(fileBuffer: ArrayBuffer, contentType: string, fileName: string): Promise<string> {
  try {
    if (contentType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      // Extract text from PDF using unpdf
      const text = await extractText(new Uint8Array(fileBuffer));
      return text || '';
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
  openai: any
) {
  console.log('Starting document analysis:', { documentId, documentVersionId, analysisType });
  
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

    console.log('Found document:', { name: document.name, type: document.type, storagePath: document.storage_path });

    // Download file from storage
    const { data: fileData, error: storageError } = await supabase.storage
      .from('deal_documents')
      .download(document.storage_path);

    if (storageError || !fileData) {
      console.error('Storage download error:', storageError);
      // Try alternative bucket names
      const { data: fileData2, error: storageError2 } = await supabase.storage
        .from('Documents')
        .download(document.storage_path);
      
      if (storageError2 || !fileData2) {
        throw new Error(`Failed to download document from storage: ${storageError?.message || storageError2?.message}`);
      }
      
      console.log('Document downloaded from Documents bucket');
      const fileBuffer = await fileData2.arrayBuffer();
      const extractedText = await extractTextFromDocument(fileBuffer, document.type, document.name);
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from the document');
      }

      console.log('Text extracted, length:', extractedText.length);
      const analysisResult = await analyzeDocumentWithAI(extractedText, analysisType, openai);
      
      return {
        ...analysisResult,
        disclaimer: 'This analysis is provided by AI and should be reviewed by qualified professionals for accuracy and completeness.'
      };
    }

    console.log('Document downloaded from deal_documents bucket');
    
    // Extract text from the document
    const fileBuffer = await fileData.arrayBuffer();
    const extractedText = await extractTextFromDocument(fileBuffer, document.type, document.name);
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text could be extracted from the document');
    }

    console.log('Text extracted, length:', extractedText.length);

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

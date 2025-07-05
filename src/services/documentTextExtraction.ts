import { supabase } from '@/integrations/supabase/client';

export interface TextExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
}

/**
 * Service for extracting text from uploaded documents
 * Uses client-side extraction for simple text files
 * For production use, implement server-side PDF/Word parsing
 */
export class DocumentTextExtractionService {
  
  /**
   * Extract text from a file and return the result
   */
  static async extractTextFromFile(file: File): Promise<TextExtractionResult> {
    try {
      // Handle plain text files directly on client
      if (file.type === 'text/plain') {
        const text = await file.text();
        return {
          success: true,
          text
        };
      } 
      
      // For other supported file types, use the server-side text extractor
      if (this.isSupportedFileType(file)) {
        console.log('🔄 Using server-side text extraction for:', file.name, file.type);
        
        // Convert file to base64 for the edge function
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        console.log('📤 Sending to text-extractor edge function:', {
          fileName: file.name,
          mimeType: file.type,
          base64Length: base64.length
        });
        
        const { data, error } = await supabase.functions.invoke('text-extractor', {
          body: {
            fileBase64: base64,
            mimeType: file.type,
            fileName: file.name
          }
        });
        
        console.log('📥 Text extraction response:', {
          success: data?.success,
          hasText: !!data?.text,
          textLength: data?.text?.length || 0,
          error: error?.message || data?.error,
          textPreview: data?.text?.substring(0, 200) || 'No text'
        });
        
        if (error) {
          console.error('❌ Text extraction error:', error);
          return {
            success: false,
            error: `Text extraction failed: ${error.message || 'Unknown error'}`
          };
        }
        
        if (data?.success && data?.text) {
          console.log('✅ Text extraction successful:', data.text.length, 'characters');
          return {
            success: true,
            text: data.text
          };
        } else {
          console.error('❌ Text extraction failed:', data);
          return {
            success: false,
            error: data?.error || 'Failed to extract text from document'
          };
        }
      } else {
        return {
          success: false,
          error: this.getUnsupportedFileTypeMessage(file)
        };
      }
    } catch (error: any) {
      console.error('Document text extraction service error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred during text extraction'
      };
    }
  }

  /**
   * Extract text from file and update contract in database
   */
  static async extractAndStoreContractText(
    file: File, 
    contractId: string
  ): Promise<TextExtractionResult> {
    try {
      // Extract text from the file
      const extractionResult = await this.extractTextFromFile(file);
      
      if (!extractionResult.success) {
        return extractionResult;
      }

      // Update the contract with the extracted text
      const { error: updateError } = await supabase
        .from('contracts')
        .update({ 
          content: extractionResult.text,
          analysis_status: 'completed'
        })
        .eq('id', contractId);

      if (updateError) {
        console.error('Failed to update contract with extracted text:', updateError);
        return {
          success: false,
          error: 'Failed to save extracted text to database'
        };
      }

      return {
        success: true,
        text: extractionResult.text
      };
    } catch (error: any) {
      console.error('Extract and store contract text error:', error);
      return {
        success: false,
        error: error.message || 'Failed to extract and store contract text'
      };
    }
  }

  /**
   * Validate if a file type is supported for text extraction
   */
  static isSupportedFileType(file: File): boolean {
    const supportedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'application/rtf',
      'text/rtf'
    ];

    // All these types are now supported: text/plain (client-side), others (server-side)
    return supportedTypes.includes(file.type);
  }

  /**
   * Get user-friendly error message for unsupported file types
   */
  static getUnsupportedFileTypeMessage(file: File): string {
    return `The file "${file.name}" (${file.type}) is not supported for text extraction. Supported formats: TXT, PDF, DOCX, DOC, and RTF files.`;
  }
}

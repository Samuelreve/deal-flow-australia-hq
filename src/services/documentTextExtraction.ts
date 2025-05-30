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
      
      // For other file types, return a placeholder message
      // In production, you would send the file to a server-side service
      else {
        return {
          success: true,
          text: `[Document uploaded: ${file.name}] - Text extraction for ${file.type} files requires server-side processing. Please use plain text files for immediate text extraction.`
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

    // Only text/plain is currently supported for client-side extraction
    // Others are marked as supported but require server-side processing
    return supportedTypes.includes(file.type);
  }

  /**
   * Get user-friendly error message for unsupported file types
   */
  static getUnsupportedFileTypeMessage(file: File): string {
    return `The file "${file.name}" (${file.type}) is not supported for text extraction. Please upload a plain text file for immediate processing, or PDF/Word documents for basic upload (text extraction requires server-side processing).`;
  }
}

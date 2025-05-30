
import { supabase } from '@/integrations/supabase/client';

export interface TextExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
}

/**
 * Service for extracting text from uploaded documents
 * Note: This is a simplified implementation that only handles plain text files
 * In production, you would implement proper PDF/Word parsing
 */
export class DocumentTextExtractionService {
  
  /**
   * Extract text from a file and return the result
   */
  static async extractTextFromFile(file: File): Promise<TextExtractionResult> {
    try {
      // For now, only handle plain text files
      if (file.type === 'text/plain') {
        const text = await file.text();
        return {
          success: true,
          text
        };
      } else {
        // For other file types, return a placeholder message
        return {
          success: true,
          text: `[Document uploaded: ${file.name}] - Text extraction for ${file.type} files is not yet implemented. Please upload a plain text file for full text extraction.`
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

    return supportedTypes.includes(file.type);
  }

  /**
   * Get user-friendly error message for unsupported file types
   */
  static getUnsupportedFileTypeMessage(file: File): string {
    return `The file "${file.name}" (${file.type}) is not supported. Please upload a PDF, Word document (.doc/.docx), RTF, or plain text file.`;
  }
}

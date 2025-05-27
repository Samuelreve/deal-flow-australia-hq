
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TextExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
}

/**
 * Service for extracting text from uploaded documents
 */
export class DocumentTextExtractionService {
  
  /**
   * Extract text from a file and return the result
   */
  static async extractTextFromFile(file: File): Promise<TextExtractionResult> {
    try {
      // Convert file to base64
      const fileBase64 = await this.fileToBase64(file);
      
      // Call the text extraction edge function
      const { data, error } = await supabase.functions.invoke('text-extractor', {
        body: {
          fileBase64: fileBase64.split(',')[1], // Remove data:mime/type;base64, prefix
          mimeType: file.type,
          fileName: file.name
        }
      });

      if (error) {
        console.error('Text extraction error:', error);
        return {
          success: false,
          error: error.message || 'Failed to extract text from document'
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Text extraction failed'
        };
      }

      return {
        success: true,
        text: data.text
      };
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

  /**
   * Convert file to base64 string
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}

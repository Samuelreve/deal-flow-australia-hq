import { DocumentMetadata, SummaryData } from '../types';
import { DocumentTextExtractionService } from '@/services/documentTextExtraction';

/**
 * Utility functions for contract analysis operations
 */

export const createDocumentMetadata = (file: File): DocumentMetadata => {
  return {
    id: `temp-${Date.now()}`,
    name: file.name,
    type: file.type,
    uploadDate: new Date().toISOString(),
    status: 'analyzing',
    version: '1.0',
    versionDate: new Date().toISOString(),
    size: file.size,
    category: 'Contract'
  };
};

/**
 * Creates a placeholder summary for development
 */
export const createPlaceholderSummary = (): SummaryData => {
  return {
    summary: [
      {
        title: "Demo Contract Analysis",
        content: "This is a demonstration of contract analysis capabilities. Upload a real document to see actual AI-powered insights."
      },
      {
        title: "Supported File Types",
        content: "The system supports PDF, Word (.docx), RTF, and text documents with advanced text extraction."
      },
      {
        title: "AI Analysis Features",
        content: "Upload your contract to get AI-powered summaries, risk assessments, key term extraction, and Q&A capabilities."
      },
      {
        title: "Getting Started",
        content: "Use the upload button to select your contract document. Questions and analysis will be based on your document content."
      }
    ],
    disclaimer: "This is a demo analysis. Upload your contract for real AI insights and analysis!"
  };
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  try {
    console.log('🔧 Extracting text from file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Use the proper DocumentTextExtractionService for all file types
    const result = await DocumentTextExtractionService.extractTextFromFile(file);
    
    if (result.success && result.text) {
      console.log('✅ Text extraction successful:', {
        textLength: result.text.length,
        preview: result.text.substring(0, 200) + '...'
      });
      return result.text;
    } else {
      console.error('❌ Text extraction failed:', result.error);
      throw new Error(result.error || 'Failed to extract text from file');
    }
  } catch (error) {
    console.error('❌ Error in extractTextFromFile:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to extract text from file');
  }
};

export const validateFileType = (file: File): boolean => {
  const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  return allowedTypes.includes(file.type);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

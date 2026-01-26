/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import {
  formatFileSize,
  getFileExtension,
  isImageFile,
  isPdfFile,
  isDocumentFile,
  isTextFile,
  requiresConversionForSigning,
  getDocumentTypeForSigning,
} from '../fileUtils';

describe('fileUtils', () => {
  describe('formatFileSize', () => {
    it('should return "0 Bytes" for 0', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format KB correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
    });

    it('should format MB correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
    });

    it('should format GB correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('getFileExtension', () => {
    it('should extract extension from filename', () => {
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('image.png')).toBe('png');
      expect(getFileExtension('file.docx')).toBe('docx');
    });

    it('should handle multiple dots in filename', () => {
      expect(getFileExtension('my.document.v2.pdf')).toBe('pdf');
    });

    it('should handle uppercase extensions', () => {
      expect(getFileExtension('DOCUMENT.PDF')).toBe('PDF');
    });

    it('should handle no extension', () => {
      expect(getFileExtension('filename')).toBe('');
    });

    it('should handle hidden files (dot prefix)', () => {
      // Files starting with dot and no extension return empty string per current implementation
      expect(getFileExtension('.gitignore')).toBe('');
    });
  });

  describe('isImageFile', () => {
    it('should return true for image files', () => {
      expect(isImageFile('photo.jpg')).toBe(true);
      expect(isImageFile('image.jpeg')).toBe(true);
      expect(isImageFile('graphic.png')).toBe(true);
      expect(isImageFile('animation.gif')).toBe(true);
      expect(isImageFile('image.bmp')).toBe(true);
      expect(isImageFile('image.webp')).toBe(true);
      expect(isImageFile('icon.svg')).toBe(true);
    });

    it('should return false for non-image files', () => {
      expect(isImageFile('document.pdf')).toBe(false);
      expect(isImageFile('file.docx')).toBe(false);
      expect(isImageFile('data.json')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isImageFile('PHOTO.JPG')).toBe(true);
      expect(isImageFile('Image.PNG')).toBe(true);
    });
  });

  describe('isPdfFile', () => {
    it('should return true for PDF files', () => {
      expect(isPdfFile('document.pdf')).toBe(true);
    });

    it('should return false for non-PDF files', () => {
      expect(isPdfFile('document.docx')).toBe(false);
      expect(isPdfFile('image.png')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isPdfFile('DOCUMENT.PDF')).toBe(true);
    });
  });

  describe('isDocumentFile', () => {
    it('should return true for Word documents', () => {
      expect(isDocumentFile('file.doc')).toBe(true);
      expect(isDocumentFile('file.docx')).toBe(true);
    });

    it('should return true for Excel documents', () => {
      expect(isDocumentFile('file.xls')).toBe(true);
      expect(isDocumentFile('file.xlsx')).toBe(true);
    });

    it('should return true for PowerPoint documents', () => {
      expect(isDocumentFile('file.ppt')).toBe(true);
      expect(isDocumentFile('file.pptx')).toBe(true);
    });

    it('should return false for other files', () => {
      expect(isDocumentFile('file.pdf')).toBe(false);
      expect(isDocumentFile('file.txt')).toBe(false);
      expect(isDocumentFile('file.png')).toBe(false);
    });
  });

  describe('isTextFile', () => {
    it('should return true for text files', () => {
      expect(isTextFile('readme.txt')).toBe(true);
    });

    it('should return false for non-text files', () => {
      expect(isTextFile('document.pdf')).toBe(false);
      expect(isTextFile('document.docx')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isTextFile('README.TXT')).toBe(true);
    });
  });

  describe('requiresConversionForSigning', () => {
    it('should return true for Word documents', () => {
      expect(requiresConversionForSigning('contract.docx')).toBe(true);
      expect(requiresConversionForSigning('contract.doc')).toBe(true);
    });

    it('should return false for PDFs', () => {
      expect(requiresConversionForSigning('contract.pdf')).toBe(false);
    });

    it('should return false for other files', () => {
      expect(requiresConversionForSigning('file.txt')).toBe(false);
      expect(requiresConversionForSigning('file.xlsx')).toBe(false);
    });
  });

  describe('getDocumentTypeForSigning', () => {
    it('should return "pdf" for PDF files', () => {
      expect(getDocumentTypeForSigning('document.pdf')).toBe('pdf');
    });

    it('should return "convertible" for Word documents', () => {
      expect(getDocumentTypeForSigning('document.docx')).toBe('convertible');
      expect(getDocumentTypeForSigning('document.doc')).toBe('convertible');
    });

    it('should return "pdf" as fallback for unknown types', () => {
      expect(getDocumentTypeForSigning('file.txt')).toBe('pdf');
      expect(getDocumentTypeForSigning('file.xlsx')).toBe('pdf');
    });
  });
});

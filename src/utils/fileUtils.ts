/**
 * Centralized file utility functions
 */

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Check if file is an image
 */
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
}

/**
 * Check if file is a PDF
 */
export function isPdfFile(filename: string): boolean {
  return getFileExtension(filename).toLowerCase() === 'pdf';
}

/**
 * Check if file is a document (Word, Excel, PowerPoint)
 */
export function isDocumentFile(filename: string): boolean {
  const documentExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  const extension = getFileExtension(filename).toLowerCase();
  return documentExtensions.includes(extension);
}

/**
 * Check if file is a text file
 */
export function isTextFile(filename: string): boolean {
  return getFileExtension(filename).toLowerCase() === 'txt';
}

/**
 * Check if file requires conversion for signature positioning
 */
export function requiresConversionForSigning(filename: string): boolean {
  const conversionExtensions = ['docx', 'doc'];
  const extension = getFileExtension(filename).toLowerCase();
  return conversionExtensions.includes(extension);
}

/**
 * Get document type for signature positioning
 */
export function getDocumentTypeForSigning(filename: string): 'pdf' | 'text' | 'convertible' {
  const extension = getFileExtension(filename).toLowerCase();
  if (extension === 'pdf') return 'pdf';
  if (['txt', 'md', 'csv'].includes(extension)) return 'text';
  if (['docx', 'doc'].includes(extension)) return 'convertible';
  return 'pdf'; // fallback
}
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
  const documentExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'];
  const extension = getFileExtension(filename).toLowerCase();
  return documentExtensions.includes(extension);
}

/**
 * Format bytes to human-readable file size
 * @param bytes Number of bytes
 * @param decimals Number of decimal places to include
 * @returns Formatted string (e.g. "1.5 MB")
 */
export function fileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

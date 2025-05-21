
import React from 'react';
import { 
  FileText, 
  FileImage, 
  FileSpreadsheet,
  File, 
  FileCode,
  FileArchive,
  FileDigit 
} from 'lucide-react';

/**
 * Get the appropriate icon component based on file type
 */
export const getFileIconByType = (fileType: string) => {
  const type = fileType.toLowerCase();
  
  if (type.includes('pdf')) {
    return FileText; // Using FileText for PDF files since FilePdf doesn't exist
  }
  
  if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].some(ext => type.includes(ext))) {
    return FileImage;
  }
  
  if (type.includes('spreadsheet') || ['xls', 'xlsx', 'csv'].some(ext => type.includes(ext))) {
    return FileSpreadsheet;
  }
  
  if (type.includes('word') || ['doc', 'docx', 'rtf', 'odt'].some(ext => type.includes(ext))) {
    return FileText;
  }
  
  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json'].some(ext => type.includes(ext))) {
    return FileCode;
  }
  
  if (['zip', 'rar', 'tar', 'gz', '7z'].some(ext => type.includes(ext))) {
    return FileArchive;
  }
  
  if (['ppt', 'pptx'].some(ext => type.includes(ext))) {
    return FileDigit;
  }
  
  // Default to generic file icon
  return File;
};


import React from 'react';
import { File, FileImage } from 'lucide-react';

const FileTypeSupportShowcase: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
        <FileImage className="h-4 w-4" />
        Enhanced File Type Support
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <File className="h-4 w-4 text-red-600" />
          <span><strong>PDF Documents</strong> - Advanced OCR extraction</span>
        </div>
        <div className="flex items-center gap-2">
          <File className="h-4 w-4 text-blue-600" />
          <span><strong>Word Files</strong> - .docx support</span>
        </div>
        <div className="flex items-center gap-2">
          <File className="h-4 w-4 text-green-600" />
          <span><strong>Text Files</strong> - Instant processing</span>
        </div>
        <div className="flex items-center gap-2">
          <File className="h-4 w-4 text-purple-600" />
          <span><strong>RTF Documents</strong> - Rich text format</span>
        </div>
      </div>
    </div>
  );
};

export default FileTypeSupportShowcase;

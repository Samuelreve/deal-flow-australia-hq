
import React from 'react';

const FileRequirements: React.FC = () => {
  return (
    <div className="text-xs text-muted-foreground space-y-1 bg-gray-50 p-3 rounded">
      <p><strong>File Requirements:</strong></p>
      <p>• Maximum file size: 25MB</p>
      <p>• Supported formats: PDF, Word (.docx), RTF, Text (.txt)</p>
      <p>• Advanced text extraction for all file types</p>
      <p>• Secure storage with user-specific access</p>
    </div>
  );
};

export default FileRequirements;

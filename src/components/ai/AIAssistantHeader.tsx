
import React, { useRef } from 'react';
import { Sparkles, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AIAssistantHeaderProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedDocument: { name: string; content: string } | null;
  onRemoveDocument: () => void;
}

const AIAssistantHeader: React.FC<AIAssistantHeaderProps> = ({
  onFileUpload,
  uploadedDocument,
  onRemoveDocument
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">AI Business Assistant</h1>
            <p className="text-gray-600">Expert business guidance powered by GPT-4o-mini</p>
          </div>
          
          {/* Document Upload */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={onFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </div>
        
        {/* Document indicator */}
        {uploadedDocument && (
          <Alert className="mt-4 bg-green-50 border-green-200">
            <FileText className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Document loaded:</strong> {uploadedDocument.name} - I can now answer questions about this document.
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemoveDocument}
                className="ml-2 h-6 text-xs"
              >
                Remove
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default AIAssistantHeader;

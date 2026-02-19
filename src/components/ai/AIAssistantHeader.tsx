
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
    <div className="bg-white dark:bg-background border-b border-gray-200 dark:border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-blue-100 dark:bg-primary/10 rounded-lg flex-shrink-0">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-foreground">AI Business Assistant</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-muted-foreground">Expert business guidance powered by GPT-4o-mini</p>
            </div>
          </div>
          
          {/* Document Upload */}
          <div className="flex items-center gap-2 sm:ml-auto flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={onFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Upload </span>Document
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

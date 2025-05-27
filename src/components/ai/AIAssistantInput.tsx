
import React from 'react';
import { Send, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AIAssistantInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  uploadedDocument: { name: string; content: string } | null;
}

const AIAssistantInput: React.FC<AIAssistantInputProps> = ({
  inputValue,
  onInputChange,
  onSendMessage,
  isLoading,
  uploadedDocument
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="border-t bg-gray-50 p-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={uploadedDocument 
              ? "Ask me anything about your document or general business questions..."
              : "Ask me about business strategy, deals, contracts, finance, or upload a document..."
            }
            disabled={isLoading}
            className="min-h-[44px] resize-none bg-white"
          />
        </div>
        <Button
          onClick={onSendMessage}
          disabled={!inputValue.trim() || isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-gray-500">
          Powered by OpenAI GPT-4o-mini • Professional business guidance • Not a substitute for professional advice
        </p>
        {uploadedDocument && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <FileText className="h-3 w-3" />
            Document context active
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistantInput;

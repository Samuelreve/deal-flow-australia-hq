import React from 'react';
import { Send, FileText, StopCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface EnhancedAIAssistantInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onCancelStream?: () => void;
  isLoading: boolean;
  isStreaming: boolean;
  uploadedDocument: { name: string; content: string } | null;
}

const EnhancedAIAssistantInput: React.FC<EnhancedAIAssistantInputProps> = ({
  inputValue,
  onInputChange,
  onSendMessage,
  onCancelStream,
  isLoading,
  isStreaming,
  uploadedDocument
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && !isStreaming) {
        onSendMessage();
      }
    }
  };

  const isDisabled = isLoading || isStreaming;

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Textarea
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={uploadedDocument 
              ? "Ask me anything about your document or general M&A questions..."
              : "Ask about deal strategy, valuation, due diligence, contracts, negotiations..."
            }
            disabled={isDisabled}
            className="min-h-[60px] max-h-[150px] resize-none bg-background"
            rows={2}
          />
        </div>
        
        {isStreaming && onCancelStream ? (
          <Button
            onClick={onCancelStream}
            variant="destructive"
            className="px-4 py-2"
          >
            <StopCircle className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={onSendMessage}
            disabled={!inputValue.trim() || isDisabled}
            className="px-4 py-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      
      {uploadedDocument && (
        <div className="flex items-center justify-end mt-2">
          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <FileText className="h-3 w-3" />
            Document context active: {uploadedDocument.name}
          </div>
        </div>
      )}
      
      <div className="mt-2 text-xs text-muted-foreground text-center">
        Press Enter to send • Shift+Enter for new line
      </div>
    </div>
  );
};

export default EnhancedAIAssistantInput;

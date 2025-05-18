
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface DocumentCommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isSubmitting?: boolean;
  placeholder?: string;
  buttonText?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  showCancel?: boolean;
}

const DocumentCommentForm = ({
  onSubmit,
  isSubmitting = false,
  placeholder = "Add a comment...",
  buttonText = "Comment",
  autoFocus = false,
  onCancel,
  showCancel = false
}: DocumentCommentFormProps) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    
    await onSubmit(content);
    setContent('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px] text-sm"
        disabled={isSubmitting}
      />
      <div className="flex justify-end gap-2">
        {showCancel && onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          size="sm" 
          disabled={!content.trim() || isSubmitting}
        >
          <Send className="h-4 w-4 mr-1" />
          {isSubmitting ? 'Posting...' : buttonText}
        </Button>
      </div>
    </form>
  );
};

export default DocumentCommentForm;


import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X } from 'lucide-react';

interface DocumentCommentInputProps {
  selectedText: string | null;
  buttonPosition: { top: number; left: number } | null;
  commentContent: string;
  setCommentContent: (content: string) => void;
  submitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
  pageNumber?: number;
}

const DocumentCommentInput: React.FC<DocumentCommentInputProps> = ({
  selectedText,
  buttonPosition,
  commentContent,
  setCommentContent,
  submitting,
  onSubmit,
  onClose,
  pageNumber,
}) => {
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div 
      className="absolute z-20 bg-background border rounded-lg shadow-lg p-4 w-80"
      style={{ 
        top: buttonPosition ? `${buttonPosition.top}px` : '50%', 
        left: buttonPosition ? `${buttonPosition.left}px` : '50%',
        transform: buttonPosition ? 'translateX(-50%)' : 'translate(-50%, -50%)'
      }}
      id="comment-input-container"
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">Add Comment{pageNumber ? ` (Page ${pageNumber})` : ''}</h4>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {selectedText && (
        <div className="bg-muted p-2 rounded-sm mb-2 text-xs italic">
          "{selectedText.length > 100 ? selectedText.substring(0, 100) + '...' : selectedText}"
        </div>
      )}
      
      <Textarea 
        ref={commentInputRef}
        value={commentContent}
        onChange={(e) => setCommentContent(e.target.value)}
        placeholder="Type your comment here..."
        className="min-h-[100px] mb-2"
        autoFocus
      />
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={submitting || !commentContent.trim()}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : 'Save Comment'}
        </Button>
      </div>
    </div>
  );
};

export default DocumentCommentInput;

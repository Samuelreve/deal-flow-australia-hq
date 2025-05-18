
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';

interface DocumentCommentFormProps {
  selectedText: string | null;
  buttonPosition: { top: number; left: number } | null;
  commentContent: string;
  submitting: boolean;
  onCommentChange: (content: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const DocumentCommentForm: React.FC<DocumentCommentFormProps> = ({
  selectedText,
  buttonPosition,
  commentContent,
  submitting,
  onCommentChange,
  onSubmit,
  onClose,
}) => {
  return (
    <div
      className="absolute z-20 bg-white shadow-lg rounded-lg p-4 w-80"
      style={{
        top: buttonPosition ? `${buttonPosition.top}px` : '50%',
        left: buttonPosition ? `${buttonPosition.left}px` : '50%',
        transform: buttonPosition ? 'translateX(-50%)' : 'translate(-50%, -50%)',
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">Add Comment</h4>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {selectedText && (
        <div className="bg-gray-50 p-2 rounded mb-2 text-xs italic">
          "{selectedText.length > 100 ? `${selectedText.substring(0, 100)}...` : selectedText}"
        </div>
      )}
      
      <textarea
        value={commentContent}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Type your comment here..."
        className="w-full border rounded-md p-2 h-24 mb-2"
      />
      
      <div className="flex justify-end">
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

export default DocumentCommentForm;

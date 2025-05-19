
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

// Define the interface for new document comment data
interface NewDocumentCommentData {
  document_version_id: string;
  content: string;
  page_number?: number | null;
  location_data?: any;
  selected_text?: string | null;
  parent_comment_id?: string | null;
}

interface DocumentCommentInputProps {
  selectedText: string | null;
  buttonPosition: { top: number; left: number } | null;
  commentContent: string;
  setCommentContent: (content: string) => void;
  isPosting: boolean;
  onSubmit: () => void;
  onClose: () => void;
  pageNumber?: number;
  locationData?: any;
  dealId?: string;
  documentId?: string;
  versionId?: string;
  submitting?: boolean; // For backward compatibility
}

const DocumentCommentInput: React.FC<DocumentCommentInputProps> = ({
  selectedText,
  buttonPosition,
  commentContent,
  setCommentContent,
  isPosting,
  submitting, // Support both isPosting and submitting for backward compatibility
  onSubmit,
  onClose,
  pageNumber,
  locationData,
  dealId,
  documentId,
  versionId,
}) => {
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  
  // Use either isPosting or submitting prop (for backwards compatibility)
  const isSubmitting = isPosting || submitting;

  // Determine if this is displayed as an absolute positioned form or inline in sidebar
  const isAbsolutePositioned = !!buttonPosition;

  return (
    <div 
      className={`${isAbsolutePositioned ? 'absolute z-20' : ''} bg-background border rounded-lg shadow-lg p-4 ${isAbsolutePositioned ? 'w-80' : 'w-full'}`}
      style={isAbsolutePositioned ? { 
        top: `${buttonPosition.top}px`, 
        left: `${buttonPosition.left}px`,
        transform: 'translateX(-50%)'
      } : undefined}
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
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={isSubmitting || !commentContent.trim() || !user}
        >
          {isSubmitting ? (
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

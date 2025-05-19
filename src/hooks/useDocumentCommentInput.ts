
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { createDocumentComment } from '@/services/documentComments';

interface UseDocumentCommentInputProps {
  versionId?: string;
  onCommentPosted?: (newComment: any) => void;
  onCancel?: () => void;
}

export const useDocumentCommentInput = ({
  versionId,
  onCommentPosted,
  onCancel
}: UseDocumentCommentInputProps) => {
  const { user } = useAuth();
  const [commentContent, setCommentContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmitComment = async (locationData?: any, pageNumber?: number, selectedText?: string | null) => {
    if (!commentContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return false;
    }

    if (!versionId || !user) {
      toast({
        title: "Error",
        description: "Missing version ID or user authentication",
        variant: "destructive",
      });
      return false;
    }

    setIsPosting(true);

    try {
      // Prepare the comment data
      const commentData = {
        document_version_id: versionId,
        content: commentContent.trim(),
        page_number: pageNumber || null,
        location_data: locationData || null,
        selected_text: selectedText || null
      };

      // Create the comment
      const newComment = await createDocumentComment(commentData);
      
      // Clear the form and notify parent
      setCommentContent('');
      
      if (onCommentPosted) {
        onCommentPosted(newComment);
      }
      
      if (onCancel) {
        onCancel();
      }
      
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to post comment",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsPosting(false);
    }
  };

  return {
    commentContent,
    setCommentContent,
    isPosting,
    handleSubmitComment
  };
};


import { useState } from 'react';
import { useDocumentComments } from '@/hooks/documentComments';
import { toast } from '@/components/ui/use-toast';

interface UseDocumentCommentHandlingProps {
  versionId?: string;
}

export function useDocumentCommentHandling({ versionId }: UseDocumentCommentHandlingProps) {
  const { comments, addComment, submitting } = useDocumentComments(versionId);
  const [commentContent, setCommentContent] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  
  // Handle opening comment input
  const handleAddComment = (selectedText: string | null, locationData: any) => {
    setShowCommentInput(true);
  };

  // Handle submitting a comment
  const handleSubmitComment = async (locationData: any, currentPage: number) => {
    if (!commentContent.trim() || !versionId) {
      toast({
        title: "Error",
        description: "Please enter a comment and ensure document version is selected.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addComment({
        content: commentContent,
        pageNumber: locationData?.pageNumber || currentPage,
        locationData: locationData
      });

      setCommentContent('');
      setShowCommentInput(false);
      
      toast({
        title: "Success",
        description: "Comment added successfully.",
      });
    } catch (err) {
      console.error('Error adding comment:', err);
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      });
    }
  };

  // Handle closing comment input
  const handleCloseCommentInput = () => {
    setShowCommentInput(false);
    setCommentContent('');
  };

  return {
    comments,
    commentContent,
    setCommentContent,
    showCommentInput,
    setShowCommentInput,
    submitting,
    handleAddComment,
    handleSubmitComment,
    handleCloseCommentInput
  };
}

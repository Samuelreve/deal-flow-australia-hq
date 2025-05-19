
import { useState, useCallback } from 'react';
import { DocumentComment } from '@/types/documentComment';
import { useDocumentComments } from './documentComments';

interface UseDocumentCommentHandlingProps {
  versionId?: string;
}

export const useDocumentCommentHandling = ({ versionId }: UseDocumentCommentHandlingProps) => {
  const { comments, loading, fetchComments, toggleResolved } = useDocumentComments(versionId);
  
  // State for comment input
  const [commentContent, setCommentContent] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  // Handle adding a comment
  const handleAddComment = useCallback((text: string | null, location: any, page?: number) => {
    setSelectedText(text);
    setLocationData(location);
    setCurrentPage(page);
    setShowCommentInput(true);
  }, []);

  // Handle submitting a comment
  const handleSubmitComment = useCallback(async (location?: any, page?: number | null) => {
    if (!commentContent.trim() || !versionId) return false;

    setSubmitting(true);
    try {
      // You can implement the actual comment submission logic here
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear input and refresh comments
      setCommentContent('');
      setShowCommentInput(false);
      fetchComments();
      return true;
    } catch (error) {
      console.error('Error submitting comment:', error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [commentContent, versionId, fetchComments]);

  // Handle closing comment input
  const handleCloseCommentInput = useCallback(() => {
    setShowCommentInput(false);
    setSelectedText(null);
    setLocationData(null);
  }, []);

  return {
    comments,
    loading,
    commentContent,
    setCommentContent,
    showCommentInput,
    setShowCommentInput,
    submitting,
    activeCommentId,
    setActiveCommentId,
    handleAddComment,
    handleSubmitComment,
    handleCloseCommentInput,
    toggleResolved,
    fetchComments
  };
};

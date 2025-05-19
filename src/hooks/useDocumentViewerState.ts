
import { useState, useEffect } from 'react';

interface UseDocumentViewerStateProps {
  documentVersionUrl: string;
}

export function useDocumentViewerState({
  documentVersionUrl,
}: UseDocumentViewerStateProps) {
  // Document viewer state
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [showCommentSidebar, setShowCommentSidebar] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [explanationResult, setExplanationResult] = useState<{ explanation?: string; disclaimer: string } | null>(null);

  // Effect to clear selection when documentVersionUrl changes
  useEffect(() => {
    setCurrentPage(1);
    setShowExplanation(false);
    setShowCommentInput(false);
  }, [documentVersionUrl]);

  // Toggle comment sidebar
  const handleToggleCommentSidebar = () => {
    setShowCommentSidebar(prev => !prev);
  };

  return {
    currentPage,
    setCurrentPage,
    numPages,
    setNumPages,
    showCommentSidebar,
    setShowCommentSidebar,
    showExplanation,
    setShowExplanation,
    showCommentInput,
    setShowCommentInput,
    commentContent,
    setCommentContent,
    explanationResult,
    setExplanationResult,
    handleToggleCommentSidebar,
  };
}

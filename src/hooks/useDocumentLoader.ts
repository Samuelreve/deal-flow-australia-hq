
import { useState, useEffect, useCallback } from 'react';

export function useDocumentLoader(documentUrl: string) {
  const [documentLoading, setDocumentLoading] = useState(true);
  const [documentError, setDocumentError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when document URL changes
    setDocumentLoading(true);
    setDocumentError(null);

    // If no URL, set error state
    if (!documentUrl) {
      setDocumentError('No document URL provided');
      setDocumentLoading(false);
    }

    // Add a fallback timeout in case the iframe events don't fire
    const timer = setTimeout(() => {
      if (documentLoading && documentUrl) {
        console.log('Document load timeout reached, assuming success');
        setDocumentLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [documentUrl]);

  const handleDocumentLoad = useCallback(() => {
    setDocumentLoading(false);
    setDocumentError(null);
  }, []);

  const handleDocumentError = useCallback(() => {
    setDocumentError('Failed to load document');
    setDocumentLoading(false);
  }, []);

  return {
    documentLoading,
    documentError,
    handleDocumentLoad,
    handleDocumentError,
    setDocumentLoading,
    setDocumentError
  };
}

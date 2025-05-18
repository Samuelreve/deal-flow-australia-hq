
import { useState, useEffect } from 'react';

export function useDocumentLoader(documentVersionUrl: string) {
  const [documentLoading, setDocumentLoading] = useState(true);
  const [documentError, setDocumentError] = useState<string | null>(null);

  useEffect(() => {
    // Reset states when URL changes
    setDocumentLoading(true);
    setDocumentError(null);

    // Simulate document loading process
    const timer = setTimeout(() => {
      if (documentVersionUrl) {
        setDocumentLoading(false);
      } else {
        setDocumentError('No document URL provided');
        setDocumentLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [documentVersionUrl]);

  const handleDocumentLoad = () => {
    setDocumentLoading(false);
  };

  const handleDocumentError = () => {
    setDocumentError('Failed to load document');
    setDocumentLoading(false);
  };

  return {
    documentLoading,
    documentError,
    handleDocumentLoad,
    handleDocumentError
  };
}

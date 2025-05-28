
import { useState, useCallback } from 'react';
import { DocumentMetadata } from '@/types/contract';

export const useContractData = () => {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [contractText, setContractText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetData = useCallback(() => {
    setDocuments([]);
    setSelectedDocument(null);
    setContractText('');
    setError(null);
    console.log('Contract data reset - ready for new document');
  }, []);

  return {
    documents,
    selectedDocument,
    contractText,
    loading,
    error,
    setDocuments,
    setSelectedDocument,
    setContractText,
    setLoading,
    setError: clearError,
    resetData
  };
};

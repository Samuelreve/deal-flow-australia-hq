
import { useState, useCallback } from 'react';
import { DocumentMetadata } from '@/types/contract';

export const useContractData = () => {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [contractText, setContractText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('useContractData state:', {
    documentsCount: documents.length,
    selectedDocument: selectedDocument?.name,
    contractTextLength: contractText.length,
    loading,
    error
  });

  const resetData = useCallback(() => {
    console.log('Resetting contract data');
    setDocuments([]);
    setSelectedDocument(null);
    setContractText('');
    setLoading(false);
    setError(null);
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
    setError,
    resetData
  };
};

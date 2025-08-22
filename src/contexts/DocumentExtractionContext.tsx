import React, { createContext, useContext, useState } from 'react';

interface ExtractedDocumentData {
  text?: string;
  extractedData?: any;
  fileName?: string;
  extractedAt?: Date;
}

interface DocumentExtractionContextType {
  extractedData: ExtractedDocumentData | null;
  setExtractedData: (data: ExtractedDocumentData | null) => void;
  clearExtractedData: () => void;
}

const DocumentExtractionContext = createContext<DocumentExtractionContextType | undefined>(undefined);

export const DocumentExtractionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [extractedData, setExtractedDataState] = useState<ExtractedDocumentData | null>(null);

  const setExtractedData = (data: ExtractedDocumentData | null) => {
    setExtractedDataState(data);
    console.log('Document extraction context updated:', data);
  };

  const clearExtractedData = () => {
    setExtractedDataState(null);
    console.log('Document extraction context cleared');
  };

  return (
    <DocumentExtractionContext.Provider value={{
      extractedData,
      setExtractedData,
      clearExtractedData
    }}>
      {children}
    </DocumentExtractionContext.Provider>
  );
};

export const useDocumentExtraction = () => {
  const context = useContext(DocumentExtractionContext);
  if (context === undefined) {
    throw new Error('useDocumentExtraction must be used within a DocumentExtractionProvider');
  }
  return context;
};
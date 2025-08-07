
import React, { createContext, useContext, ReactNode } from 'react';

interface DocumentPermissions {
  canUpload: boolean;
  canDelete: boolean;
  canAddVersions: boolean;
  canShare: boolean;
  canAnalyze: boolean;
}

interface DocumentPermissionsContextType {
  permissions: DocumentPermissions;
  userRole: string;
  isParticipant: boolean;
}

const DocumentPermissionsContext = createContext<DocumentPermissionsContextType | undefined>(undefined);

interface DocumentPermissionsProviderProps {
  children: ReactNode;
  userRole: string;
  isParticipant: boolean;
  dealStatus?: string;
}

export const DocumentPermissionsProvider: React.FC<DocumentPermissionsProviderProps> = ({
  children,
  userRole,
  isParticipant,
  dealStatus = 'active'
}) => {
  // Calculate permissions based on role and deal status
  const permissions: DocumentPermissions = {
    canUpload: isParticipant, // All participants can upload documents
    canDelete: isParticipant && ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase()),
    canAddVersions: isParticipant, // All participants can add versions
    canShare: isParticipant,
    canAnalyze: true // Analysis is available to all users
  };

  const contextValue: DocumentPermissionsContextType = {
    permissions,
    userRole,
    isParticipant
  };

  return (
    <DocumentPermissionsContext.Provider value={contextValue}>
      {children}
    </DocumentPermissionsContext.Provider>
  );
};

export const useDocumentPermissions = () => {
  const context = useContext(DocumentPermissionsContext);
  if (context === undefined) {
    throw new Error('useDocumentPermissions must be used within a DocumentPermissionsProvider');
  }
  return context;
};


import React from 'react';
import { Document, DocumentVersion } from "@/types/documentVersion";

interface DocumentManagementActionsProps {
  onDeleteDocument: (document: Document) => void;
  onDeleteVersion: (version: DocumentVersion) => void;
  onShareVersion: (version: DocumentVersion) => void;
  onSelectVersion: (version: DocumentVersion) => void;
  onSelectDocument: (document: Document) => Promise<void>;
  onVersionsUpdated: () => void;
}

const DocumentManagementActions: React.FC<DocumentManagementActionsProps> = ({
  onDeleteDocument,
  onDeleteVersion,
  onShareVersion,
  onSelectVersion,
  onSelectDocument,
  onVersionsUpdated
}) => {
  // This component serves as a container for action handlers
  // It doesn't render anything but provides a clean interface for actions
  return null;
};

export default DocumentManagementActions;

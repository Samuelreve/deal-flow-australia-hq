
import { DocumentVersion } from "@/types/deal";
import { Loader2 } from "lucide-react";
import DocumentVersionItem from "./DocumentVersionItem";
import { useDocumentVersionActions } from "@/hooks/useDocumentVersionActions";

interface DocumentVersionListProps {
  versions: DocumentVersion[];
  loading: boolean;
  onDeleteVersion: (version: DocumentVersion) => void;
  onSelectVersion: (version: DocumentVersion) => void;
  selectedVersionId: string;
  onShareVersion: (version: DocumentVersion) => void;
  userRole: string;
  userId?: string;
  documentOwnerId: string;
}

const DocumentVersionList = ({
  versions,
  loading,
  onDeleteVersion,
  onSelectVersion,
  selectedVersionId,
  onShareVersion,
  userRole,
  userId,
  documentOwnerId,
}: DocumentVersionListProps) => {
  const { canDelete } = useDocumentVersionActions({
    userRole,
    userId,
    documentOwnerId
  });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-2">
        No versions available
      </div>
    );
  }

  return (
    <div className="space-y-1 mt-2">
      <h4 className="text-sm font-medium text-muted-foreground">Versions</h4>
      <div className="bg-muted/40 rounded-md p-1 space-y-1">
        {versions.map((version) => (
          <DocumentVersionItem 
            key={version.id}
            version={version}
            selectedVersionId={selectedVersionId}
            onSelect={onSelectVersion}
            onDelete={onDeleteVersion}
            onShare={onShareVersion}
            canDelete={canDelete(version)}
          />
        ))}
      </div>
    </div>
  );
};

export default DocumentVersionList;

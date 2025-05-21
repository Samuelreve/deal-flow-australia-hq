
import { useState } from "react";
import { DocumentVersion } from "@/types/documentVersion";
import { Loader2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import DocumentVersionItem from "./DocumentVersionItem";
import { useDocumentVersionActions } from "@/hooks/useDocumentVersionActions";
import DocumentVersionComparison from "./DocumentVersionComparison";

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
  dealId: string;
  documentId: string;
  onVersionsUpdated?: () => void;
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
  dealId,
  documentId,
  onVersionsUpdated = () => {}
}: DocumentVersionListProps) => {
  const [comparisonOpen, setComparisonOpen] = useState(false);
  
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
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">Versions</h4>
        {versions.length > 1 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 flex items-center gap-1 text-xs"
            onClick={() => setComparisonOpen(true)}
          >
            <History className="h-3 w-3" />
            Compare
          </Button>
        )}
      </div>
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
            dealId={dealId}
            documentId={documentId}
            onRestored={onVersionsUpdated}
            onCompare={() => setComparisonOpen(true)}
          />
        ))}
      </div>
      
      <DocumentVersionComparison 
        open={comparisonOpen}
        onOpenChange={setComparisonOpen}
        versions={versions}
        dealId={dealId}
      />
    </div>
  );
};

export default DocumentVersionList;

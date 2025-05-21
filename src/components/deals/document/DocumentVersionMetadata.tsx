
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentVersion, Document } from "@/types/documentVersion";
import { useDocumentVersionManagement } from "@/hooks/useDocumentVersionManagement";
import { format } from "date-fns";
import { fileSize } from "@/lib/formatBytes";

export interface DocumentVersionMetadataProps {
  version: DocumentVersion;
  dealId: string;
  onUpdate?: () => void;
}

const DocumentVersionMetadata: React.FC<DocumentVersionMetadataProps> = ({
  version,
  dealId,
  onUpdate
}) => {
  const { isLoading } = useDocumentVersionManagement(
    dealId,
    version.documentId,
    onUpdate
  );

  if (!version) {
    return null;
  }

  return (
    <Card className="w-full mt-4">
      <CardContent className="pt-4">
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Version:</div>
            <div>{version.versionNumber}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Uploaded:</div>
            <div>{format(new Date(version.uploadedAt), "PPP p")}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Size:</div>
            <div>{fileSize(version.size)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Type:</div>
            <div>{version.type}</div>
          </div>
          {version.isRestored && (
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">Status:</div>
              <div className="text-amber-600">Restored Version</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentVersionMetadata;

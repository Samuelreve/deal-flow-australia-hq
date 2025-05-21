
import React from "react";
import { DocumentVersion, Document } from "@/types/documentVersion";
import DocumentViewerContainer from "@/components/documents/DocumentViewerContainer";
import DocumentVersionMetadata from "./DocumentVersionMetadata";
import { Card } from "@/components/ui/card";

interface DocumentViewerSectionProps {
  selectedVersionUrl: string;
  documentVersions: DocumentVersion[];
  dealId: string;
  selectedDocument: Document | null;
  selectedVersionId: string;
  onVersionsUpdated: () => void;
}

const DocumentViewerSection: React.FC<DocumentViewerSectionProps> = ({
  selectedVersionUrl,
  documentVersions,
  dealId,
  selectedDocument,
  selectedVersionId,
  onVersionsUpdated
}) => {
  // Find the selected version object
  const selectedVersion = documentVersions.find(v => v.id === selectedVersionId);

  return (
    <div className="lg:col-span-2 space-y-4">
      <Card className="overflow-hidden h-[70vh]">
        {!selectedVersionUrl ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center p-6">
              <h3 className="text-xl font-semibold mb-2">No document selected</h3>
              <p>
                Select a document from the sidebar to view its content
              </p>
            </div>
          </div>
        ) : (
          <DocumentViewerContainer
            documentVersionUrl={selectedVersionUrl}
            dealId={dealId}
            documentId={selectedDocument?.id}
            versionId={selectedVersionId}
          />
        )}
      </Card>

      {selectedVersion && (
        <DocumentVersionMetadata 
          version={selectedVersion}
          dealId={dealId}
          onUpdate={onVersionsUpdated}
        />
      )}
    </div>
  );
};

export default DocumentViewerSection;

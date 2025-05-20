
import { DocumentVersion } from "@/types/deal";
import DocumentViewer from "@/components/documents/DocumentViewer";

interface DocumentViewerSectionProps {
  selectedVersionUrl: string;
  documentVersions: DocumentVersion[];
  dealId: string;
  selectedDocument?: { id: string } | null;
  selectedVersionId: string;
}

const DocumentViewerSection = ({
  selectedVersionUrl,
  documentVersions,
  dealId,
  selectedDocument,
  selectedVersionId
}: DocumentViewerSectionProps) => {
  return (
    <div className="lg:col-span-2 h-[600px]">
      {selectedVersionUrl && documentVersions.length > 0 ? (
        <DocumentViewer 
          documentVersionUrl={selectedVersionUrl}
          dealId={dealId}
          documentId={selectedDocument?.id}
          versionId={selectedVersionId}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-muted/50 rounded-lg border">
          <p className="text-muted-foreground">
            {documentVersions.length > 0 
              ? "Select a document version to view" 
              : "No documents available for viewing"}
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentViewerSection;


import { useState } from "react";
import { DocumentVersion } from "@/types/deal";
import DocumentViewer, { DocumentViewerRef } from "@/components/documents/DocumentViewer";
import SmartContractAssistant from "./SmartContractAssistant";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const [selectedText, setSelectedText] = useState<string | null>(null);
  
  // Handler for when text is selected in the document viewer
  const handleTextSelected = (text: string | null) => {
    setSelectedText(text);
  };

  return (
    <div className="lg:col-span-2 h-[600px]">
      {selectedVersionUrl && documentVersions.length > 0 ? (
        <div className="h-full flex flex-col">
          <div className="flex justify-end mb-2 gap-2">
            {/* Only show when a document is selected */}
            {selectedDocument && selectedVersionId && (
              <SmartContractAssistant
                dealId={dealId}
                documentId={selectedDocument.id}
                versionId={selectedVersionId}
                selectedText={selectedText}
                userRole={user?.role}
              />
            )}
          </div>
          <div className="flex-1">
            <DocumentViewer 
              documentVersionUrl={selectedVersionUrl}
              dealId={dealId}
              documentId={selectedDocument?.id}
              versionId={selectedVersionId}
              onTextSelected={handleTextSelected}
            />
          </div>
        </div>
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

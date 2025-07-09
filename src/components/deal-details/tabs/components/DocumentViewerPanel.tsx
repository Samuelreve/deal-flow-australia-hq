import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import DocumentActions from "./DocumentActions";
import DocumentPreview from "./DocumentPreview";
import DocumentComments from "./DocumentComments";
import { Document } from "@/types/deal";

interface DocumentViewerPanelProps {
  selectedDocument: Document | null;
  documentPreview: string;
  previewLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  comments: any[];
  showCommentForm: boolean;
  isSubmittingComment: boolean;
  dealId: string;
  onAnalyzeDocument: (type: 'summary' | 'key_terms' | 'risks') => void;
  onOpenDocumentInNewTab: () => void;
  onToggleCommentForm: () => void;
  onAddComment: (content: string) => void;
}

const DocumentViewerPanel: React.FC<DocumentViewerPanelProps> = ({
  selectedDocument,
  documentPreview,
  previewLoading,
  comments,
  showCommentForm,
  isSubmittingComment,
  dealId,
  onAnalyzeDocument,
  onOpenDocumentInNewTab,
  onToggleCommentForm,
  onAddComment,
}) => {
  return (
    <Card className="h-[600px] flex flex-col">
      {selectedDocument ? (
        <>
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{selectedDocument.name}</CardTitle>
                <p className="text-sm text-muted-foreground">Version {selectedDocument.version}</p>
              </div>
              <DocumentActions onAnalyzeDocument={onAnalyzeDocument} />
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex min-h-0 p-4 gap-4">
            <DocumentPreview
              documentPreview={documentPreview}
              previewLoading={previewLoading}
              onOpenDocumentInNewTab={onOpenDocumentInNewTab}
              selectedDocument={selectedDocument}
              dealId={dealId}
            />
            <DocumentComments
              comments={comments}
              showCommentForm={showCommentForm}
              isSubmittingComment={isSubmittingComment}
              selectedDocument={selectedDocument}
              onToggleCommentForm={onToggleCommentForm}
              onAddComment={onAddComment}
            />
          </CardContent>
        </>
      ) : (
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Select a document to view</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default DocumentViewerPanel;
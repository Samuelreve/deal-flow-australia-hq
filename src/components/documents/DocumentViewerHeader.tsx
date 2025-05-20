
import React from 'react';
import { Button } from "@/components/ui/button";
import { PenSquare, MessageSquare, Share, Download, FileSearch } from "lucide-react";
import DocumentSummaryButton from "@/components/deals/document/DocumentSummaryButton";
import DocumentAnalysisButton from "@/components/deals/document/DocumentAnalysisButton";
import { useAuth } from "@/contexts/AuthContext";

interface DocumentViewerHeaderProps {
  documentName?: string;
  versionNumber?: number;
  onToggleCommentSidebar: () => void;
  showCommentSidebar: boolean;
  dealId: string;
  documentId?: string;
  versionId?: string;
  onShareClick?: () => void;
  documentVersionUrl?: string;
}

const DocumentViewerHeader: React.FC<DocumentViewerHeaderProps> = ({
  documentName = "Document",
  versionNumber,
  onToggleCommentSidebar,
  showCommentSidebar,
  dealId,
  documentId,
  versionId,
  onShareClick,
  documentVersionUrl
}) => {
  const { user } = useAuth();
  
  // Determine the user's role here (simplified, adjust based on your actual role logic)
  const userRole = user ? 'admin' : 'user';  // Replace with actual role logic
  
  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center">
        <FileSearch className="h-5 w-5 mr-2 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-medium truncate max-w-[150px] sm:max-w-md">
            {documentName}
          </h3>
          {versionNumber && (
            <p className="text-xs text-muted-foreground">Version {versionNumber}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2">
        {documentId && versionId && dealId && (
          <DocumentSummaryButton 
            dealId={dealId}
            documentId={documentId}
            versionId={versionId}
            className="hidden sm:flex"
          />
        )}
        
        {/* Add Document Analysis Button */}
        {documentId && versionId && dealId && (
          <DocumentAnalysisButton
            dealId={dealId}
            documentId={documentId}
            versionId={versionId}
            userRole={userRole}
            className="hidden sm:flex"
          />
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          title="Toggle comments sidebar"
          onClick={onToggleCommentSidebar}
          className={showCommentSidebar ? "bg-muted" : ""}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        
        {onShareClick && (
          <Button 
            variant="ghost" 
            size="sm"
            title="Share document" 
            onClick={onShareClick}
          >
            <Share className="h-4 w-4" />
          </Button>
        )}
        
        {documentVersionUrl && (
          <Button 
            variant="ghost" 
            size="sm" 
            title="Download document"
            onClick={() => window.open(documentVersionUrl, '_blank')}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default DocumentViewerHeader;


import React, { useState } from 'react';
import { Document } from "@/types/deal";
import { AlertCircle, Upload, FolderOpen } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentUploadForm from "./DocumentUploadForm";
import DealRoomDocumentSelector from "./DealRoomDocumentSelector";

interface DocumentUploadProps {
  dealId: string;
  onUpload?: () => void;
  userRole?: string;
  isParticipant?: boolean;
  documents?: Document[];
  permissions?: {
    canUpload: boolean;
    canAddVersions: boolean;
    userRole: string | null;
  };
  dealStatus?: string | null;
  milestoneId?: string; // Optional milestone ID to associate document with
  milestoneTitle?: string; // Optional milestone title for UI context
}

const DocumentUpload = ({ 
  dealId,
  onUpload,
  userRole = 'user',
  isParticipant = true,
  documents = [],
  permissions,
  dealStatus,
  milestoneId,
  milestoneTitle
}: DocumentUploadProps) => {
  const [isDealRoomSelectorOpen, setIsDealRoomSelectorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("upload");
  
  // Check if user has permission to upload documents
  const canUploadDocuments = permissions?.canUpload ?? isParticipant;
  
  // Check if deal status allows uploads
  const isDealStatusAllowingUploads = !dealStatus || ['draft', 'active', 'pending'].includes(dealStatus);

  // Don't render if user can't upload or deal status doesn't allow uploads
  if (!canUploadDocuments || !isDealStatusAllowingUploads) {
    // If it's a status restriction, show an explanation
    if (isParticipant && !isDealStatusAllowingUploads) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Document uploads are not allowed when the deal is in {dealStatus} status.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  }

  const handleDocumentUpload = () => {
    // Call the onUpload callback if provided
    onUpload?.();
  };

  const handleDocumentLinked = () => {
    // Call the onUpload callback if provided (same behavior after linking)
    onUpload?.();
  };

  // If milestoneId is provided, show tabs for upload vs deal room selection
  if (milestoneId) {
    return (
      <div className="border-t pt-4 mt-4">
        <h4 className="text-lg font-semibold mb-3">
          {milestoneTitle ? `Add Document for: ${milestoneTitle}` : 'Add Document'}
        </h4>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload New
            </TabsTrigger>
            <TabsTrigger value="dealroom" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Choose from Deal Room
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-0">
            <div className="mb-4">
              <DocumentUploadForm 
                dealId={dealId}
                onUpload={handleDocumentUpload}
                documents={documents}
                milestoneId={milestoneId}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="dealroom" className="mt-0">
            <div className="mb-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-3">
                  Select an existing document from the deal room to link it to this milestone.
                </p>
                <button
                  onClick={() => setIsDealRoomSelectorOpen(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted transition-colors"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Browse Deal Room Documents
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Deal Room Document Selector Modal */}
        <DealRoomDocumentSelector
          isOpen={isDealRoomSelectorOpen}
          onClose={() => setIsDealRoomSelectorOpen(false)}
          dealId={dealId}
          milestoneId={milestoneId}
          milestoneTitle={milestoneTitle}
          onDocumentLinked={handleDocumentLinked}
        />
      </div>
    );
  }

  // Default behavior without milestone (just upload form)
  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="text-lg font-semibold mb-3">
        Upload Document
      </h4>
      
      <div className="mb-4">
        <DocumentUploadForm 
          dealId={dealId}
          onUpload={handleDocumentUpload}
          documents={documents}
        />
      </div>
    </div>
  );
};

export default DocumentUpload;

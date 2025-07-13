import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileText, ChevronDown, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDocumentUploadWizard } from '@/hooks/deals/useDocumentUploadWizard';
import { DealCreationData } from '../../types';

// Import the same components used in step 4
import { DocumentRequirements } from '../../document-upload/DocumentRequirements';
import { DocumentUploadArea } from '../../document-upload/DocumentUploadArea';
import { UploadedDocumentsList } from '../../document-upload/UploadedDocumentsList';

interface BusinessDocumentUploadProps {
  data: DealCreationData;
  showDocuments: boolean;
  onToggleDocuments: (show: boolean) => void;
  onUpdateData: (updates: Partial<DealCreationData>) => void;
  tempDealId: string;
}

export const BusinessDocumentUpload: React.FC<BusinessDocumentUploadProps> = ({
  data,
  showDocuments,
  onToggleDocuments,
  onUpdateData,
  tempDealId
}) => {
  const { toast } = useToast();
  const { uploading, uploadFile, deleteFile } = useDocumentUploadWizard();
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const newDocuments = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File size must be under 10MB`);
        continue;
      }

      // Validate file type - same as step 4
      const allowedTypes = [
        'application/pdf', 
        'image/jpeg', 
        'image/png', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: File type not supported`);
        continue;
      }

      // Upload file to storage with business_document category
      try {
        const uploadedDoc = await uploadFile(file, tempDealId, 'business_document');
        if (uploadedDoc) {
          newDocuments.push(uploadedDoc);
        } else {
          errors.push(`${file.name}: Upload failed`);
        }
      } catch (error) {
        console.error('Upload error for file:', file.name, error);
        errors.push(`${file.name}: Upload failed`);
      }
    }

    setUploadErrors(errors);
    
    if (newDocuments.length > 0) {
      onUpdateData({
        uploadedDocuments: [...(data.uploadedDocuments || []), ...newDocuments]
      });
      
      toast({
        title: "Documents Uploaded",
        description: `${newDocuments.length} document(s) uploaded successfully.`,
      });
    }

    if (errors.length > 0) {
      toast({
        title: "Upload Errors",
        description: `${errors.length} file(s) failed to upload.`,
        variant: "destructive"
      });
    }
  };

  const removeDocument = async (docId: string) => {
    const doc = data.uploadedDocuments?.find(d => d.id === docId);
    
    // Delete from storage if it has a storage path
    if (doc?.storagePath) {
      const deleted = await deleteFile(doc.storagePath, tempDealId);
      if (!deleted) {
        toast({
          title: "Error",
          description: "Failed to delete file from storage",
          variant: "destructive"
        });
        return;
      }
    }

    // Remove from local state
    onUpdateData({
      uploadedDocuments: (data.uploadedDocuments || []).filter(doc => doc.id !== docId)
    });
  };

  const updateDocumentCategory = (docId: string, category: string) => {
    onUpdateData({
      uploadedDocuments: (data.uploadedDocuments || []).map(doc => 
        doc.id === docId ? { ...doc, category } : doc
      )
    });
  };

  const uploadedDocuments = data.uploadedDocuments || [];

  return (
    <Collapsible open={showDocuments} onOpenChange={onToggleDocuments}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Upload Business Documents (optional)
            {uploadedDocuments.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {uploadedDocuments.length}
              </span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${showDocuments ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Upload business documents to help speed up the due diligence process. These documents will be securely stored and linked to your deal.
          </AlertDescription>
        </Alert>

        <DocumentRequirements uploadedDocuments={uploadedDocuments} />

        <DocumentUploadArea 
          uploading={uploading}
          uploadErrors={uploadErrors}
          onFileUpload={handleFileUpload}
        />

        <UploadedDocumentsList
          uploadedDocuments={uploadedDocuments}
          uploading={uploading}
          onRemoveDocument={removeDocument}
          onUpdateDocumentCategory={updateDocumentCategory}
        />

        {uploadedDocuments.length > 0 && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              These documents will be analyzed by AI to enhance the deal description generation in the next step.
            </AlertDescription>
          </Alert>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
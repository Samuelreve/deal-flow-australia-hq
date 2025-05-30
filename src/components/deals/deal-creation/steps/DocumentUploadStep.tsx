
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDocumentUploadWizard } from '@/hooks/deals/useDocumentUploadWizard';

import { DocumentRequirements } from '../document-upload/DocumentRequirements';
import { DocumentUploadArea } from '../document-upload/DocumentUploadArea';
import { UploadedDocumentsList } from '../document-upload/UploadedDocumentsList';

import { StepProps, REQUIRED_DOCUMENTS } from '../types';

interface DocumentUploadStepProps extends StepProps {
  dealId?: string;
}

const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({ 
  data, 
  updateData, 
  onNext, 
  onPrev, 
  dealId 
}) => {
  const { toast } = useToast();
  const { uploading, uploadFile, deleteFile } = useDocumentUploadWizard();
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  // Use real deal ID if available, otherwise fall back to temporary ID for creation flow
  const currentDealId = dealId || `temp-${data.dealTitle?.replace(/\s+/g, '-').toLowerCase() || 'deal'}-${Date.now()}`;

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

      // Validate file type
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

      // Upload file to storage
      try {
        const uploadedDoc = await uploadFile(file, currentDealId);
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
      updateData({
        uploadedDocuments: [...data.uploadedDocuments, ...newDocuments]
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
    const doc = data.uploadedDocuments.find(d => d.id === docId);
    
    // Delete from storage if it has a storage path
    if (doc?.storagePath) {
      const deleted = await deleteFile(doc.storagePath);
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
    updateData({
      uploadedDocuments: data.uploadedDocuments.filter(doc => doc.id !== docId)
    });
  };

  const updateDocumentCategory = (docId: string, category: string) => {
    updateData({
      uploadedDocuments: data.uploadedDocuments.map(doc => 
        doc.id === docId ? { ...doc, category } : doc
      )
    });
  };

  const hasRequiredDocuments = () => {
    return REQUIRED_DOCUMENTS.every(reqDoc => 
      data.uploadedDocuments.some(doc => doc.category === reqDoc)
    );
  };

  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Upload your business documents securely. Required documents are needed to proceed, 
          while recommended documents help speed up the due diligence process.
          {dealId ? ' Documents will be associated with your deal.' : ' Documents will be temporarily stored and linked to your deal once created.'}
        </AlertDescription>
      </Alert>

      <DocumentRequirements uploadedDocuments={data.uploadedDocuments} />

      <DocumentUploadArea 
        uploading={uploading}
        uploadErrors={uploadErrors}
        onFileUpload={handleFileUpload}
      />

      <UploadedDocumentsList
        uploadedDocuments={data.uploadedDocuments}
        uploading={uploading}
        onRemoveDocument={removeDocument}
        onUpdateDocumentCategory={updateDocumentCategory}
      />

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={onNext} 
          size="lg" 
          className="min-w-[160px]"
          disabled={!hasRequiredDocuments() || uploading}
        >
          {uploading ? 'Uploading...' : hasRequiredDocuments() ? 'Review & Submit' : 'Upload Required Documents'}
        </Button>
      </div>
    </div>
  );
};

export default DocumentUploadStep;

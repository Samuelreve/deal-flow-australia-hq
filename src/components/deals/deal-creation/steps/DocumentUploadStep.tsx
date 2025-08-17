
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileText, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useDocumentUploadWizard } from '@/hooks/deals/useDocumentUploadWizard';
import { useDocumentAutoExtraction } from '@/hooks/useDocumentAutoExtraction';

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
  const { extractDataFromDocument, isExtracting } = useDocumentAutoExtraction();
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [autoExtractEnabled, setAutoExtractEnabled] = useState(true);

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
          
          // Auto-extract data if enabled and it's a PDF
          if (autoExtractEnabled && file.type === 'application/pdf' && data.dealCategory) {
            try {
              // Convert file to base64 for extraction
              const fileBase64 = await fileToBase64(file);
              await extractDataFromDocument(
                fileBase64,
                file.name,
                file.type,
                {
                  dealCategory: data.dealCategory,
                  onDataExtracted: (extractedData) => {
                    // Merge extracted data with current form data
                    updateData(extractedData);
                  }
                }
              );
            } catch (extractionError) {
              console.error('Auto-extraction error for file:', file.name, extractionError);
              // Don't add to errors array as extraction is optional
            }
          }
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
      const deleted = await deleteFile(doc.storagePath, currentDealId);
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data URL prefix
      };
      reader.onerror = reject;
    });
  };

  const hasRequiredDocuments = () => {
    return true; // Remove required document validation
  };

  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Upload your business documents securely. Documents help speed up the due diligence process.
          {dealId ? ' Documents will be associated with your deal.' : ' Documents will be temporarily stored and linked to your deal once created.'}
        </AlertDescription>
      </Alert>

      <DocumentRequirements uploadedDocuments={data.uploadedDocuments} />

      {/* Auto-extraction toggle */}
      {data.dealCategory && data.dealCategory !== 'business_sale' && (
        <div className="flex items-center space-x-2 p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5">
          <Sparkles className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <Label htmlFor="auto-extract" className="text-sm font-medium">
              Auto-extract deal information from PDFs
            </Label>
            <p className="text-xs text-muted-foreground">
              Automatically extract {data.dealCategory?.replace('_', ' ')} specific details from uploaded documents
            </p>
          </div>
          <Switch
            id="auto-extract"
            checked={autoExtractEnabled}
            onCheckedChange={setAutoExtractEnabled}
          />
        </div>
      )}

      <DocumentUploadArea 
        uploading={uploading || isExtracting}
        uploadErrors={uploadErrors}
        onFileUpload={handleFileUpload}
      />
      
      {isExtracting && (
        <Alert>
          <Sparkles className="h-4 w-4 animate-pulse" />
          <AlertDescription>
            Analyzing document and extracting deal information...
          </AlertDescription>
        </Alert>
      )}

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
          disabled={!hasRequiredDocuments() || uploading || isExtracting}
        >
          {uploading ? 'Uploading...' : isExtracting ? 'Extracting data...' : 'Review & Submit'}
        </Button>
      </div>
    </div>
  );
};

export default DocumentUploadStep;

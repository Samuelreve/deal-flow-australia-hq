import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Upload, FileText, X, ChevronDown, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDocumentUploadWizard } from '@/hooks/deals/useDocumentUploadWizard';
import { DealCreationData, UploadedDocument } from '../../types';

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

    const newDocuments: UploadedDocument[] = [];
    const errors: string[] = [];

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
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: File type not supported`);
        continue;
      }

      // Upload file to storage
      try {
        const uploadedDoc = await uploadFile(file, tempDealId);
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
        description: `${newDocuments.length} document(s) uploaded successfully for AI analysis.`,
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
            Upload business documents (financial statements, business plans, etc.) to help AI generate more accurate and detailed deal descriptions.
          </AlertDescription>
        </Alert>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
            className="hidden"
            id="business-document-upload"
            onChange={(e) => handleFileUpload(e.target.files)}
            disabled={uploading}
          />
          <div className="space-y-2">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <div>
              <Label 
                htmlFor="business-document-upload" 
                className="cursor-pointer text-sm font-medium hover:text-primary"
              >
                Click to upload documents
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, TXT (max 10MB each)
              </p>
            </div>
          </div>
          {uploading && (
            <div className="mt-2 text-sm text-muted-foreground">
              Uploading documents...
            </div>
          )}
        </div>

        {/* Upload Errors */}
        {uploadErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {uploadErrors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Uploaded Documents List */}
        {uploadedDocuments.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Uploaded Documents ({uploadedDocuments.length})
            </Label>
            <div className="space-y-2">
              {uploadedDocuments.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{doc.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.category && `${doc.category} • `}
                        {(doc.size && (doc.size / 1024 / 1024).toFixed(1))} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(doc.id)}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

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
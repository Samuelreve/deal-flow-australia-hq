
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, FileText, Check, AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useDocumentUploadWizard } from '@/hooks/deals/useDocumentUploadWizard';

import { StepProps, DOCUMENT_CATEGORIES, REQUIRED_DOCUMENTS, RECOMMENDED_DOCUMENTS } from '../types';

const DocumentUploadStep: React.FC<StepProps> = ({ data, updateData, onNext, onPrev }) => {
  const { toast } = useToast();
  const { uploading, uploadFile, deleteFile } = useDocumentUploadWizard();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  // Generate a temporary deal ID for uploads during creation
  const tempDealId = React.useMemo(() => 
    data.dealTitle ? `temp-${data.dealTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}` : `temp-deal-${Date.now()}`,
    [data.dealTitle]
  );

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
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: File type not supported`);
        continue;
      }

      // Upload file to storage
      const uploadedDoc = await uploadFile(file, tempDealId);
      if (uploadedDoc) {
        newDocuments.push(uploadedDoc);
      } else {
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasRequiredDocuments = () => {
    return REQUIRED_DOCUMENTS.every(reqDoc => 
      data.uploadedDocuments.some(doc => doc.category === reqDoc)
    );
  };

  const getDocumentStatusBadge = (category: string) => {
    if (REQUIRED_DOCUMENTS.includes(category)) {
      return <Badge variant="destructive">Required</Badge>;
    }
    if (RECOMMENDED_DOCUMENTS.includes(category)) {
      return <Badge variant="secondary">Recommended</Badge>;
    }
    return <Badge variant="outline">Optional</Badge>;
  };

  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Upload your business documents securely. Required documents are needed to proceed, 
          while recommended documents help speed up the due diligence process.
        </AlertDescription>
      </Alert>

      {/* Document Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Document Requirements</CardTitle>
          <CardDescription>
            Here's what we need to get your deal ready
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2 text-red-600">Required Documents</h4>
              <ul className="text-sm space-y-1">
                {REQUIRED_DOCUMENTS.map(doc => (
                  <li key={doc} className="flex items-center space-x-2">
                    {data.uploadedDocuments.some(d => d.category === doc) ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-2 text-blue-600">Recommended Documents</h4>
              <ul className="text-sm space-y-1">
                {RECOMMENDED_DOCUMENTS.map(doc => (
                  <li key={doc} className="flex items-center space-x-2">
                    {data.uploadedDocuments.some(d => d.category === doc) ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2 text-gray-600">Other Documents</h4>
              <p className="text-sm text-muted-foreground">
                Additional documents that may be relevant to your business sale
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Drag and drop files here, or click to browse
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PDF, Word documents, and images up to 10MB each
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  handleFileUpload(target.files);
                };
                input.click();
              }}
            >
              {uploading ? 'Uploading...' : 'Choose Files'}
            </Button>
          </div>

          {uploadErrors.length > 0 && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {uploadErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      {data.uploadedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Uploaded Documents ({data.uploadedDocuments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.uploadedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <select
                      value={doc.category}
                      onChange={(e) => updateDocumentCategory(doc.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      {DOCUMENT_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    
                    {getDocumentStatusBadge(doc.category)}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(doc.id)}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

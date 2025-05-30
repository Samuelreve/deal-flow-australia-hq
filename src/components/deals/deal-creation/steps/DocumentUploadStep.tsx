
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { StepProps, DOCUMENT_TYPES, UploadedDocument } from '../types';

const DocumentUploadStep: React.FC<StepProps> = ({ data, updateData, onNext, onPrev }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const requiredDocs = ['Certificate of Registration', 'Seller ID'];
  const recommendedDocs = ['Financial Statements', 'Business Valuation', 'Asset List'];

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const newDocuments: UploadedDocument[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newDoc: UploadedDocument = {
        id: Math.random().toString(36).substr(2, 9),
        filename: file.name,
        type: 'Other', // Could be improved with file type detection
        size: file.size,
        uploadedAt: new Date()
      };
      
      newDocuments.push(newDoc);
    }

    updateData({ 
      uploadedDocuments: [...data.uploadedDocuments, ...newDocuments] 
    });
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeDocument = (docId: string) => {
    const filtered = data.uploadedDocuments.filter(doc => doc.id !== docId);
    updateData({ uploadedDocuments: filtered });
  };

  const updateDocumentType = (docId: string, type: string) => {
    const updated = data.uploadedDocuments.map(doc => 
      doc.id === docId ? { ...doc, type } : doc
    );
    updateData({ uploadedDocuments: updated });
  };

  const getRequiredDocStatus = () => {
    const uploaded = data.uploadedDocuments.map(doc => doc.type);
    const missingRequired = requiredDocs.filter(req => !uploaded.includes(req));
    return { uploaded: uploaded.length, missing: missingRequired };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const status = getRequiredDocStatus();
  const canProceed = status.missing.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Upload Supporting Documents</h2>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Your documents are encrypted and visible only to authorized parties. 
          Required documents help establish credibility with potential buyers.
        </AlertDescription>
      </Alert>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Document Upload</CardTitle>
          <CardDescription>
            Drag and drop files here, or click to browse. Accepted formats: PDF, DOC, DOCX, JPG, PNG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragOver 
                ? 'border-primary bg-primary/10' 
                : 'border-muted-foreground hover:border-primary'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {dragOver ? 'Drop files here' : 'Choose files or drag them here'}
            </p>
            <p className="text-sm text-muted-foreground">
              Maximum file size: 10MB per file
            </p>
            
            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {uploading && (
            <div className="mt-4">
              <Progress value={70} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">Uploading documents...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Required Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {requiredDocs.map(docType => {
              const hasDoc = data.uploadedDocuments.some(doc => doc.type === docType);
              return (
                <div key={docType} className="flex items-center justify-between">
                  <span className="text-sm">{docType}</span>
                  <Badge variant={hasDoc ? "default" : "secondary"}>
                    {hasDoc ? 'Uploaded' : 'Missing'}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              Recommended Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommendedDocs.map(docType => {
              const hasDoc = data.uploadedDocuments.some(doc => doc.type === docType);
              return (
                <div key={docType} className="flex items-center justify-between">
                  <span className="text-sm">{docType}</span>
                  <Badge variant={hasDoc ? "default" : "outline"}>
                    {hasDoc ? 'Uploaded' : 'Optional'}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Uploaded Documents List */}
      {data.uploadedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uploaded Documents</CardTitle>
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
                        {formatFileSize(doc.size)} • {doc.uploadedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={doc.type}
                      onChange={(e) => updateDocumentType(doc.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      {DOCUMENT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeDocument(doc.id)}
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

      {/* Warning for missing required docs */}
      {!canProceed && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please upload the required documents: {status.missing.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} size="lg" disabled={!canProceed}>
          Continue to Review
        </Button>
      </div>
    </div>
  );
};

export default DocumentUploadStep;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertTriangle, X, Shield, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { StepProps, DOCUMENT_CATEGORIES, REQUIRED_DOCUMENTS, RECOMMENDED_DOCUMENTS, UploadedDocument } from '../types';

const DocumentUploadStep: React.FC<StepProps> = ({ data, updateData, onNext, onPrev }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        type: 'Other',
        category: detectDocumentCategory(file.name),
        size: file.size,
        uploadedAt: new Date(),
        url: URL.createObjectURL(file) // Temporary URL for demo
      };
      
      newDocuments.push(newDoc);
    }

    updateData({ 
      uploadedDocuments: [...data.uploadedDocuments, ...newDocuments] 
    });
    setUploading(false);
  };

  const detectDocumentCategory = (filename: string): string => {
    const name = filename.toLowerCase();
    if (name.includes('certificate') || name.includes('registration')) return 'Certificate of Registration';
    if (name.includes('abn') || name.includes('acn')) return 'ABN/ACN Confirmation';
    if (name.includes('financial') || name.includes('p&l') || name.includes('balance')) return 'Financial Statements';
    if (name.includes('lease')) return 'Lease Agreements';
    if (name.includes('asset') || name.includes('inventory')) return 'Asset List';
    if (name.includes('valuation')) return 'Business Valuation';
    if (name.includes('contract')) return 'Key Contracts';
    if (name.includes('id') || name.includes('license') || name.includes('passport')) return 'Seller ID';
    return 'Other';
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

  const updateDocumentCategory = (docId: string, category: string) => {
    const updated = data.uploadedDocuments.map(doc => 
      doc.id === docId ? { ...doc, category } : doc
    );
    updateData({ uploadedDocuments: updated });
  };

  const getRequiredDocStatus = () => {
    const uploaded = data.uploadedDocuments.map(doc => doc.category);
    const missingRequired = REQUIRED_DOCUMENTS.filter(req => !uploaded.includes(req));
    const hasRecommended = RECOMMENDED_DOCUMENTS.filter(rec => uploaded.includes(rec));
    
    return { 
      missingRequired, 
      hasRecommended,
      totalUploaded: uploaded.length 
    };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getAIMissingDocumentTip = () => {
    const status = getRequiredDocStatus();
    
    if (data.dealType === 'Asset Sale' && !status.hasRecommended.includes('Asset List')) {
      return "Most buyers expect to see a detailed asset list for an Asset Sale. Uploading it now can speed up due diligence.";
    }
    
    if (!status.hasRecommended.includes('Financial Statements')) {
      return "Financial statements greatly increase buyer confidence and can help you achieve a better price.";
    }
    
    if (!status.hasRecommended.includes('Business Valuation')) {
      return "A professional business valuation strengthens your negotiating position and validates your asking price.";
    }
    
    return null;
  };

  const status = getRequiredDocStatus();
  const canProceed = status.missingRequired.length === 0;
  const aiTip = getAIMissingDocumentTip();

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your documents are encrypted and stored securely. They're only visible to authorized parties 
          you invite to your deal. Upload core documents now to speed up the due diligence process.
        </AlertDescription>
      </Alert>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Document Upload
          </CardTitle>
          <CardDescription>
            Drag and drop files here, or click to browse. Accepted: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragOver 
                ? 'border-primary bg-primary/10' 
                : 'border-muted-foreground hover:border-primary hover:bg-muted/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className={`h-12 w-12 mx-auto mb-4 ${dragOver ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-lg font-medium mb-2">
              {dragOver ? 'Drop files here' : 'Choose files or drag them here'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Multiple files supported • Auto-categorization • Secure encryption
            </p>
            <Button variant="outline" className="mt-2">
              Browse Files
            </Button>
            
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
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Uploading and encrypting documents...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Required Documents
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>These documents are required to create your deal listing</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {REQUIRED_DOCUMENTS.map(docType => {
              const hasDoc = data.uploadedDocuments.some(doc => doc.category === docType);
              return (
                <div key={docType} className="flex items-center justify-between">
                  <span className="text-sm">{docType}</span>
                  <Badge variant={hasDoc ? "default" : "destructive"}>
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>These documents help buyers evaluate your business and can speed up the sale</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {RECOMMENDED_DOCUMENTS.map(docType => {
              const hasDoc = data.uploadedDocuments.some(doc => doc.category === docType);
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

      {/* AI Missing Document Tip */}
      {aiTip && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>AI Tip:</strong> {aiTip}
          </AlertDescription>
        </Alert>
      )}

      {/* Uploaded Documents List */}
      {data.uploadedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Uploaded Documents ({data.uploadedDocuments.length})</span>
              <Badge variant="outline">{status.totalUploaded} files</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.uploadedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
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
                      value={doc.category}
                      onChange={(e) => updateDocumentCategory(doc.id, e.target.value)}
                      className="text-sm border rounded px-3 py-1 bg-background"
                    >
                      {DOCUMENT_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeDocument(doc.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
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

      {/* Missing Required Documents Warning */}
      {!canProceed && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Required documents missing:</strong> {status.missingRequired.join(', ')}
            <br />
            Please upload these documents to continue with your deal creation.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} size="lg" disabled={!canProceed} className="min-w-[160px]">
          Continue to Review
        </Button>
      </div>
    </div>
  );
};

export default DocumentUploadStep;

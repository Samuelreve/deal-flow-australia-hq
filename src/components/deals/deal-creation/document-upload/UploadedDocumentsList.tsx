
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, X } from 'lucide-react';
import { UploadedDocument, DOCUMENT_CATEGORIES, REQUIRED_DOCUMENTS, RECOMMENDED_DOCUMENTS } from '../types';

interface UploadedDocumentsListProps {
  uploadedDocuments: UploadedDocument[];
  uploading: boolean;
  onRemoveDocument: (docId: string) => void;
  onUpdateDocumentCategory: (docId: string, category: string) => void;
}

export const UploadedDocumentsList: React.FC<UploadedDocumentsListProps> = ({
  uploadedDocuments,
  uploading,
  onRemoveDocument,
  onUpdateDocumentCategory
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  if (uploadedDocuments.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Uploaded Documents ({uploadedDocuments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {uploadedDocuments.map((doc) => (
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
                  onChange={(e) => onUpdateDocumentCategory(doc.id, e.target.value)}
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
                  onClick={() => onRemoveDocument(doc.id)}
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
  );
};

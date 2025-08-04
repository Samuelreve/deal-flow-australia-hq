import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileText, Sparkles } from "lucide-react";
import { getFileIconByType } from "@/lib/fileIcons";
import DocumentUploadForm from "@/components/deals/document/DocumentUploadForm";
import { Document } from "@/types/deal";
import { documentStorageService } from "@/services/documents/documentStorageService";

interface DocumentListPanelProps {
  documents: Document[];
  selectedDocument: Document | null;
  showUploadForm: boolean;
  dealId: string;
  onSelectDocument: (doc: Document) => void;
  onToggleUploadForm: () => void;
  onShowTemplateModal: () => void;
  onDocumentUpload: () => void;
}

const DocumentListPanel: React.FC<DocumentListPanelProps> = ({
  documents,
  selectedDocument,
  showUploadForm,
  dealId,
  onSelectDocument,
  onToggleUploadForm,
  onShowTemplateModal,
  onDocumentUpload,
}) => {
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'bg-green-100 text-green-800 border-green-200';
      case 'final': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    const colors: Record<string, string> = {
      'Financial': 'bg-purple-100 text-purple-800 border-purple-200',
      'Legal': 'bg-red-100 text-red-800 border-red-200',
      'Operational': 'bg-blue-100 text-blue-800 border-blue-200',
      'Compliance': 'bg-orange-100 text-orange-800 border-orange-200',
    };
    
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleDownload = async (doc: Document) => {
    try {
      // Try to use the document's URL directly first
      if (doc.url) {
        window.open(doc.url, '_blank');
      } else {
        console.error('No URL available for document download');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  return (
    <Card className="h-[900px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg mb-3">Deal Documents</CardTitle>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
            onClick={onToggleUploadForm}
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-200"
            onClick={onShowTemplateModal}
          >
            <Sparkles className="h-4 w-4" />
            Generate Template
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
        {showUploadForm && (
          <div className="p-4 border-b bg-muted/30">
            <DocumentUploadForm 
              dealId={dealId}
              onUpload={onDocumentUpload}
              documents={documents}
            />
          </div>
        )}
        
        <div className="h-full overflow-y-auto custom-scrollbar">
          {documents.length === 0 ? (
            <div className="text-center py-8 px-4">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No documents uploaded yet</p>
              <p className="text-xs text-muted-foreground">Upload documents to get started</p>
            </div>
          ) : (
            <div className="space-y-1">
              {documents.map((doc) => {
                const FileIcon = getFileIconByType(doc.type);
                const isSelected = selectedDocument?.id === doc.id;
                
                return (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDocument(doc)}
                    className={`p-3 cursor-pointer border-l-2 transition-colors ${
                      isSelected 
                        ? 'bg-primary/5 border-l-primary' 
                        : 'hover:bg-muted/50 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FileIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(doc);
                            }}
                            title="Download document"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          {doc.category && (
                            <Badge variant="outline" className={`text-xs ${getCategoryColor(doc.category)}`}>
                              {doc.category}
                            </Badge>
                          )}
                          <Badge variant="outline" className={`text-xs ${getStatusColor(doc.status)}`}>
                            {doc.status}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          <p>v{doc.version} • {formatFileSize(doc.size)}</p>
                          <p>{doc.uploadedAt.toLocaleDateString()}</p>
                          {doc.uploaderName && (
                            <p>by {doc.uploaderName}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentListPanel;
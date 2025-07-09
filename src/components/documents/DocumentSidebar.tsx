import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Share, FileText, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getFileIconByType } from "@/lib/fileIcons";

interface Document {
  id: string;
  name: string;
  category?: string;
  status: 'draft' | 'final' | 'signed';
  version: number;
  size: number;
  type: string;
  created_at: string;
  uploaded_by: string;
  storage_path: string;
}

interface DocumentSidebarProps {
  dealId: string;
  selectedDocument: Document | null;
  onDocumentSelect: (document: Document) => void;
  onUploadClick: () => void;
  onGenerateTemplate: () => void;
  onShareDocument: (document: Document) => void;
}

const DocumentSidebar: React.FC<DocumentSidebarProps> = ({
  dealId,
  selectedDocument,
  onDocumentSelect,
  onUploadClick,
  onGenerateTemplate,
  onShareDocument
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, [dealId]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive"
        });
        return;
      }

      setDocuments(data || []);
      
      // Auto-select first document if none selected
      if (data && data.length > 0 && !selectedDocument) {
        onDocumentSelect(data[0]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Deal Documents</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" onClick={onUploadClick} className="flex items-center gap-1">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            <Button size="sm" variant="outline" onClick={onGenerateTemplate} className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              Generate Template
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="max-h-[calc(100vh-300px)]">
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
                    onClick={() => onDocumentSelect(doc)}
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
                              onShareDocument(doc);
                            }}
                          >
                            <Share className="h-3 w-3" />
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
                          <p>{new Date(doc.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DocumentSidebar;
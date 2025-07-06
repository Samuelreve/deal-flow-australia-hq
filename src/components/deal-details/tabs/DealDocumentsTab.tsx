import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Share, FileText, Download, Eye, MessageSquare, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getFileIconByType } from "@/lib/fileIcons";
import DocumentUploadForm from "@/components/deals/document/DocumentUploadForm";
import TemplateGenerationModal from "@/components/deals/document/TemplateGenerationModal";
import DocumentAnalysisModal from "@/components/deals/document/DocumentAnalysisModal";

interface DatabaseDocument {
  id: string;
  name: string;
  category?: string;
  status: string;
  version: number;
  size: number;
  type: string;
  created_at: string;
  uploaded_by: string;
  storage_path: string;
}

interface DealDocumentsTabProps {
  dealId: string;
}

const DealDocumentsTab: React.FC<DealDocumentsTabProps> = ({ dealId }) => {
  const [documents, setDocuments] = useState<DatabaseDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DatabaseDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
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
      if (data && data.length > 0 && !selectedDocument) {
        setSelectedDocument(data[0]);
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

  const handleDocumentUpload = () => {
    fetchDocuments();
    setShowUploadForm(false);
  };

  const handleAnalyzeDocument = (analysisType: string) => {
    if (!selectedDocument) return;
    setShowAnalysisModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Left Panel - Document List */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Deal Documents</CardTitle>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => setShowUploadForm(!showUploadForm)}
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-1"
                  onClick={() => setShowTemplateModal(true)}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Template
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 overflow-y-auto">
            {showUploadForm && (
              <div className="p-4 border-b bg-muted/30">
                <DocumentUploadForm 
                  dealId={dealId}
                  onUpload={handleDocumentUpload}
                  documents={documents}
                />
              </div>
            )}
            
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
                      onClick={() => setSelectedDocument(doc)}
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
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
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
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Document Viewer */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          {selectedDocument ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedDocument.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Version {selectedDocument.version}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={() => handleAnalyzeDocument('summary')}
                    >
                      <Eye className="h-4 w-4" />
                      Summarize
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={() => handleAnalyzeDocument('key_terms')}
                    >
                      <FileText className="h-4 w-4" />
                      Key Terms
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={() => handleAnalyzeDocument('risks')}
                    >
                      <Download className="h-4 w-4" />
                      Risks
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex">
                {/* Document Viewer Area */}
                <div className="flex-1 bg-muted/20 rounded border mr-4 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Document Preview</p>
                    <p className="text-xs text-muted-foreground">Click to view full document</p>
                  </div>
                </div>

                {/* Comments Sidebar */}
                <div className="w-80 border-l pl-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Comments</h4>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      Add Comment
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-center py-8">
                      <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No comments yet</p>
                      <p className="text-xs text-muted-foreground">Select text to add a comment</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a document to view</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
      
      {/* Modals */}
      <TemplateGenerationModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        dealId={dealId}
        onDocumentSaved={() => fetchDocuments()}
      />
      
      <DocumentAnalysisModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        document={selectedDocument}
        dealId={dealId}
      />
    </div>
  );
};

export default DealDocumentsTab;
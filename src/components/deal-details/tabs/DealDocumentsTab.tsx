import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Share, FileText, Download, Eye, MessageSquare, Sparkles, AlertTriangle, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getFileIconByType } from "@/lib/fileIcons";
import { useAuth } from "@/contexts/AuthContext";
import DocumentUploadForm from "@/components/deals/document/DocumentUploadForm";
import TemplateGenerationModal from "@/components/deals/document/TemplateGenerationModal";
import DirectAnalysisModal from "@/components/deals/document/DirectAnalysisModal";
import { Document } from "@/types/deal";

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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisType, setAnalysisType] = useState<'summary' | 'key_terms' | 'risks'>('summary');
  const [documentPreview, setDocumentPreview] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Map database documents to Document type
  const mapToDocument = (dbDoc: DatabaseDocument): Document => ({
    id: dbDoc.id,
    name: dbDoc.name,
    url: '', // Will be populated when needed
    uploadedBy: dbDoc.uploaded_by,
    uploadedAt: new Date(dbDoc.created_at),
    size: dbDoc.size,
    type: dbDoc.type,
    status: dbDoc.status as "draft" | "final" | "signed",
    version: dbDoc.version,
    category: dbDoc.category,
    comments: [],
    versions: [],
    latestVersionId: undefined,
    latestVersion: undefined
  });

  useEffect(() => {
    fetchDocuments();
  }, [dealId]);

  useEffect(() => {
    if (selectedDocument) {
      fetchDocumentPreview(selectedDocument);
    }
  }, [selectedDocument]);

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

      const mappedDocuments = data ? data.map(mapToDocument) : [];
      setDocuments(mappedDocuments);
      if (mappedDocuments.length > 0 && !selectedDocument) {
        setSelectedDocument(mappedDocuments[0]);
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

  // Map Document back to database format for analysis modal
  const mapToDatabaseDocument = (doc: Document): DatabaseDocument => ({
    id: doc.id,
    name: doc.name,
    category: doc.category,
    status: doc.status,
    version: doc.version,
    size: doc.size,
    type: doc.type,
    created_at: doc.uploadedAt.toISOString(),
    uploaded_by: doc.uploadedBy,
    storage_path: '' // This field may not be available in the mapped document
  });

  const handleDocumentUpload = () => {
    fetchDocuments();
    setShowUploadForm(false);
  };

  const fetchDocumentPreview = async (document: Document) => {
    setPreviewLoading(true);
    setDocumentPreview('');
    
    try {
      // Get the document file from storage
      const { data: storageData, error: storageError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', document.id)
        .single();

      if (storageError || !storageData?.storage_path) {
        console.error('Error getting storage path:', storageError);
        setDocumentPreview('Document metadata not found. The file may need to be re-uploaded.');
        return;
      }

      // First check if file exists in storage
      const { data: fileList, error: listError } = await supabase.storage
        .from('deal_documents')
        .list('', { search: storageData.storage_path });

      if (listError || !fileList || fileList.length === 0) {
        console.error('File not found in storage:', { listError, path: storageData.storage_path });
        setDocumentPreview('Document file not found in storage. The file may need to be re-uploaded.');
        return;
      }

      // For text-based files, extract content for preview
      if (document.type === 'text/plain' || 
          document.type === 'application/pdf' ||
          document.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          document.type === 'application/rtf') {
        
        // Download the file and extract text
        const { data: fileData, error: fileError } = await supabase.storage
          .from('deal_documents')
          .download(storageData.storage_path);

        if (fileError) {
          console.error('Error downloading file:', fileError);
          if (fileError.message?.includes('not_found') || fileError.message?.includes('404')) {
            setDocumentPreview('Document file missing from storage. Please re-upload the document.');
          } else {
            setDocumentPreview('Unable to access document file. Please try again or re-upload.');
          }
          return;
        }

        // Convert file to base64 for text extraction
        const fileBuffer = await fileData.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));

        // Call text extraction service
        const { data: extractionData, error: extractionError } = await supabase.functions.invoke(
          'text-extractor',
          {
            body: {
              fileBase64: base64,
              mimeType: document.type,
              fileName: document.name
            }
          }
        );

        if (extractionError || !extractionData?.success) {
          console.error('Error extracting text:', extractionError);
          setDocumentPreview('Unable to extract document content for preview. Document exists but text extraction failed.');
          return;
        }

        // Show first 500 characters as preview
        const fullText = extractionData.text || '';
        const preview = fullText.length > 500 ? fullText.substring(0, 500) + '...' : fullText;
        setDocumentPreview(preview);
      } else {
        setDocumentPreview(`Preview not available for ${document.type.split('/')[1].toUpperCase()} files. Click to view full document.`);
      }
    } catch (error) {
      console.error('Error fetching document preview:', error);
      setDocumentPreview('Error loading document preview. The document file may be missing or corrupted.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleOpenDocumentInNewTab = async (document: Document) => {
    try {
      // Get storage path
      const { data: storageData, error: storageError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', document.id)
        .single();

      if (storageError || !storageData?.storage_path) {
        toast({
          title: "Error",
          description: "Document metadata not found. The file may need to be re-uploaded.",
          variant: "destructive"
        });
        return;
      }

      // Create a signed URL for the document
      const { data: urlData, error: urlError } = await supabase.storage
        .from('deal_documents')
        .createSignedUrl(storageData.storage_path, 3600); // 1 hour expiry

      if (urlError || !urlData?.signedUrl) {
        console.error('Error creating signed URL:', urlError);
        
        if (urlError.message?.includes('not_found') || urlError.message?.includes('404')) {
          toast({
            title: "Document Not Found",
            description: "The document file is missing from storage. Please re-upload the document.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: "Unable to generate document link. Please try again.",
            variant: "destructive"
          });
        }
        return;
      }

      // Open in new tab
      window.open(urlData.signedUrl, '_blank');
    } catch (error) {
      console.error('Error opening document:', error);
      toast({
        title: "Error",
        description: "Failed to open document. The file may be missing or corrupted.",
        variant: "destructive"
      });
    }
  };

  const handleAnalyzeDocument = (type: 'summary' | 'key_terms' | 'risks') => {
    if (!selectedDocument) return;
    setAnalysisType(type);
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
                            <p>{doc.uploadedAt.toLocaleDateString()}</p>
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
      <div className="lg:col-span-2 space-y-4">
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
                      <Key className="h-4 w-4" />
                      Key Terms
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={() => handleAnalyzeDocument('risks')}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Risks
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex">
                {/* Document Viewer Area */}
                <div 
                  className="flex-1 bg-muted/20 rounded border mr-4 flex flex-col cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => selectedDocument && handleOpenDocumentInNewTab(selectedDocument)}
                >
                  <div className="flex items-center justify-between p-3 border-b">
                    <h4 className="font-medium">Document Preview</h4>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 p-4 overflow-y-auto">
                    {previewLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : documentPreview ? (
                      <div className="text-sm">
                        <pre className="whitespace-pre-wrap font-sans text-muted-foreground leading-relaxed">
                          {documentPreview}
                        </pre>
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-muted-foreground text-center">
                            Click anywhere to view full document in new tab
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground mb-2">Select a document to preview</p>
                          <p className="text-xs text-muted-foreground">Click to view full document</p>
                        </div>
                      </div>
                    )}
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
      
      <DirectAnalysisModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        document={selectedDocument ? { id: selectedDocument.id, name: selectedDocument.name, type: selectedDocument.type } : null}
        dealId={dealId}
        analysisType={analysisType}
      />
    </div>
  );
};

export default DealDocumentsTab;
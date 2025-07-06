import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Share, FileText, Download, Eye, MessageSquare, Sparkles, AlertTriangle, Key, ExternalLink, Send } from "lucide-react";
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
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
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
      // Fetch comments for the selected document
      if (selectedDocument.latestVersionId) {
        fetchComments(selectedDocument.latestVersionId);
      }
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

      // Handle storage path - check if it needs deal ID prefix
      const storagePath = storageData.storage_path;
      let fullStoragePath: string;
      
      if (storagePath.startsWith(dealId + '/') || storagePath.includes('/')) {
        // Path already contains deal ID or folder structure
        fullStoragePath = storagePath;
      } else {
        // Path is just filename, need to add deal ID prefix
        fullStoragePath = `${dealId}/${storagePath}`;
      }

      // Create a signed URL for the document preview
      const { data: urlData, error: urlError } = await supabase.storage
        .from('deal_documents')
        .createSignedUrl(fullStoragePath, 3600); // 1 hour expiry

      if (urlError || !urlData?.signedUrl) {
        console.error('Error creating signed URL for preview:', urlError);
        if (urlError.message?.includes('not_found') || urlError.message?.includes('404')) {
          setDocumentPreview('Document file missing from storage. Please re-upload the document.');
        } else {
          setDocumentPreview('Unable to generate document preview. Please try again or re-upload.');
        }
        return;
      }

      // Set the signed URL as the preview (for iframe display)
      setDocumentPreview(urlData.signedUrl);
      console.log('✅ Document preview URL created successfully:', urlData.signedUrl);

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

      // Handle storage path - check if it needs deal ID prefix
      const storagePath = storageData.storage_path;
      let fullStoragePath: string;
      
      if (storagePath.startsWith(dealId + '/') || storagePath.includes('/')) {
        // Path already contains deal ID or folder structure
        fullStoragePath = storagePath;
      } else {
        // Path is just filename, need to add deal ID prefix
        fullStoragePath = `${dealId}/${storagePath}`;
      }

      // Create a signed URL for the document
      const { data: urlData, error: urlError } = await supabase.storage
        .from('deal_documents')
        .createSignedUrl(fullStoragePath, 3600); // 1 hour expiry

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

  const handleAddComment = async (content: string) => {
    if (!selectedDocument || !user) return;

    setIsSubmittingComment(true);
    try {
      // Get the latest document version
      const { data: versionData, error: versionError } = await supabase
        .from('documents')
        .select('latest_version_id')
        .eq('id', selectedDocument.id)
        .single();

      if (versionError || !versionData?.latest_version_id) {
        toast({
          title: "Error",
          description: "Unable to find document version for commenting",
          variant: "destructive"
        });
        return;
      }

      // Add the comment
      const { data: commentData, error: commentError } = await supabase
        .from('document_comments')
        .insert({
          document_version_id: versionData.latest_version_id,
          content: content,
          user_id: user.id
        })
        .select(`
          *,
          profiles:user_id (
            name,
            avatar_url
          )
        `)
        .single();

      if (commentError) {
        console.error('Error adding comment:', commentError);
        toast({
          title: "Error",
          description: "Failed to add comment",
          variant: "destructive"
        });
        return;
      }

      // Add to local state
      setComments(prev => [commentData, ...prev]);
      setShowCommentForm(false);
      
      toast({
        title: "Success",
        description: "Comment added successfully"
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const fetchComments = async (documentId: string) => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('document_comments')
        .select(`
          *,
          profiles:user_id (
            name,
            avatar_url
          )
        `)
        .eq('document_version_id', documentId)
        .order('created_at', { ascending: false });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        return;
      }

      setComments(commentsData || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
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
                  className="flex-1 bg-muted/20 rounded border mr-4 flex flex-col"
                >
                  <div className="flex items-center justify-between p-3 border-b">
                    <h4 className="font-medium">Document Preview</h4>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0"
                        onClick={() => selectedDocument && handleOpenDocumentInNewTab(selectedDocument)}
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-4 overflow-y-auto">
                    {previewLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : documentPreview ? (
                      <div className="h-full">
                        {/* Check if documentPreview is a URL (starts with http) */}
                        {documentPreview.startsWith('http') ? (
                          <div className="h-full flex flex-col">
                            <iframe
                              src={documentPreview}
                              className="w-full flex-1 border rounded"
                              style={{ minHeight: '400px' }}
                              title="Document Preview"
                              onError={() => {
                                console.error('Iframe failed to load document');
                              }}
                            />
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-xs text-muted-foreground text-center">
                                Document preview • Use the button above to open in new tab
                              </p>
                            </div>
                          </div>
                        ) : (
                          /* Fallback for error messages or text content */
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
                        )}
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
                <div className="w-80 border-l pl-4 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Comments</h4>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={() => setShowCommentForm(!showCommentForm)}
                      disabled={!selectedDocument}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Add Comment
                    </Button>
                  </div>
                  
                  {/* Comment Form */}
                  {showCommentForm && (
                    <div className="mb-4 p-3 border rounded-lg bg-muted/20">
                      <div className="space-y-3">
                        <Textarea 
                          placeholder="Add your comment..."
                          className="min-h-[80px] resize-none"
                          id="comment-input"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              const content = (e.target as HTMLTextAreaElement).value.trim();
                              if (content && !isSubmittingComment) {
                                handleAddComment(content);
                                (e.target as HTMLTextAreaElement).value = '';
                              }
                            }
                          }}
                        />
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setShowCommentForm(false)}
                            disabled={isSubmittingComment}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => {
                              const textarea = document.getElementById('comment-input') as HTMLTextAreaElement;
                              const content = textarea?.value.trim();
                              if (content && !isSubmittingComment) {
                                handleAddComment(content);
                                textarea.value = '';
                              }
                            }}
                            disabled={isSubmittingComment}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            {isSubmittingComment ? 'Adding...' : 'Add Comment'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Comments List */}
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {comments.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No comments yet</p>
                        <p className="text-xs text-muted-foreground">
                          {showCommentForm ? "Add a comment above" : "Click Add Comment to get started"}
                        </p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="p-3 border rounded-lg bg-background">
                          <div className="flex items-start gap-2 mb-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {comment.profiles?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {comment.profiles?.name || 'Unknown User'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-foreground">{comment.content}</p>
                        </div>
                      ))
                    )}
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
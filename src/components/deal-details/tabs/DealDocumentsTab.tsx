import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import TemplateGenerationModal from "@/components/deals/document/TemplateGenerationModal";
import DirectAnalysisModal from "@/components/deals/document/DirectAnalysisModal";
import DocumentListPanel from "./components/DocumentListPanel";
import DocumentViewerPanel from "./components/DocumentViewerPanel";
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

  const handleDocumentUpload = () => {
    fetchDocuments();
    setShowUploadForm(false);
  };

  const fetchDocumentPreview = async (document: Document) => {
    setPreviewLoading(true);
    setDocumentPreview('');
    
    try {
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

      const storagePath = storageData.storage_path;
      let fullStoragePath: string;
      
      if (storagePath.startsWith(dealId + '/') || storagePath.includes('/')) {
        fullStoragePath = storagePath;
      } else {
        fullStoragePath = `${dealId}/${storagePath}`;
      }

      const { data: urlData, error: urlError } = await supabase.storage
        .from('deal_documents')
        .createSignedUrl(fullStoragePath, 3600);

      if (urlError || !urlData?.signedUrl) {
        console.error('Error creating signed URL for preview:', urlError);
        if (urlError.message?.includes('not_found') || urlError.message?.includes('404')) {
          setDocumentPreview('Document file missing from storage. Please re-upload the document.');
        } else {
          setDocumentPreview('Unable to generate document preview. Please try again or re-upload.');
        }
        return;
      }

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

      const storagePath = storageData.storage_path;
      let fullStoragePath: string;
      
      if (storagePath.startsWith(dealId + '/') || storagePath.includes('/')) {
        fullStoragePath = storagePath;
      } else {
        fullStoragePath = `${dealId}/${storagePath}`;
      }

      const { data: urlData, error: urlError } = await supabase.storage
        .from('deal_documents')
        .createSignedUrl(fullStoragePath, 3600);

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
        <DocumentListPanel
          documents={documents}
          selectedDocument={selectedDocument}
          showUploadForm={showUploadForm}
          dealId={dealId}
          onSelectDocument={setSelectedDocument}
          onToggleUploadForm={() => setShowUploadForm(!showUploadForm)}
          onShowTemplateModal={() => setShowTemplateModal(true)}
          onDocumentUpload={handleDocumentUpload}
        />
      </div>

      {/* Right Panel - Document Viewer */}
      <div className="lg:col-span-2 space-y-4">
        <DocumentViewerPanel
          selectedDocument={selectedDocument}
          documentPreview={documentPreview}
          previewLoading={previewLoading}
          comments={comments}
          showCommentForm={showCommentForm}
          isSubmittingComment={isSubmittingComment}
          onAnalyzeDocument={handleAnalyzeDocument}
          onOpenDocumentInNewTab={() => selectedDocument && handleOpenDocumentInNewTab(selectedDocument)}
          onToggleCommentForm={() => setShowCommentForm(!showCommentForm)}
          onAddComment={handleAddComment}
        />
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
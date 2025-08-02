import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import TemplateGenerationModal from "@/components/deals/document/TemplateGenerationModal";
import DocumentListPanel from "./components/DocumentListPanel";
import DocumentViewerPanel from "./components/DocumentViewerPanel";
import { Document } from "@/types/deal";
import DocumentAnalysisModal from "@/components/deals/document/DocumentAnalysisModal";
import ContractAnalyzerDialog from "@/components/deals/document/ContractAnalyzerDialog";
import { useAnalysisOperations } from "@/hooks/document-ai/useAnalysisOperations";
import { useDocumentComments } from "@/hooks/documentComments";
import { mapDbCommentToServiceComment } from "@/services/documentComment/mappers";
import { toast } from "sonner";

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
  uploader?: {
    name: string;
    email: string;
  };
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
  const [showContractAnalyzer, setShowContractAnalyzer] = useState(false);
  
  // Initialize analysis operations
  const analysisOps = useAnalysisOperations({ dealId, documentId: selectedDocument?.id });
  const [documentPreview, setDocumentPreview] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [currentVersionId, setCurrentVersionId] = useState<string | undefined>();
  const { toast: showToast } = useToast();
  const { user } = useAuth();
  
  // Use the real-time document comments hook
  const {
    comments: dbComments,
    loading: commentsLoading,
    submitting: isSubmittingComment,
    addComment,
    editComment,
    deleteComment,
    toggleResolved
  } = useDocumentComments(currentVersionId);
  
  // Convert database comments to the format expected by DocumentComments component
  const mapDbCommentToLegacyFormat = (dbComment: any) => ({
    id: dbComment.id,
    content: dbComment.content,
    created_at: dbComment.created_at,
    user_id: dbComment.user_id,
    parent_comment_id: dbComment.parent_comment_id,
    profiles: dbComment.user ? {
      name: dbComment.user.name
    } : undefined,
    replies: dbComment.replies ? dbComment.replies.map(mapDbCommentToLegacyFormat) : undefined
  });
  
  const comments = dbComments.map(mapDbCommentToLegacyFormat);

  // Map database documents to Document type
  const mapToDocument = (dbDoc: DatabaseDocument): Document => ({
    id: dbDoc.id,
    name: dbDoc.name,
    url: '', // Will be populated when needed
    uploadedBy: dbDoc.uploaded_by,
    uploaderName: dbDoc.uploader?.name,
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
      // Get the latest version ID for real-time comments
      const fetchLatestVersion = async () => {
        const { data: versionData, error } = await supabase
          .from('document_versions')
          .select('id')
          .eq('document_id', selectedDocument.id)
          .order('version_number', { ascending: false })
          .limit(1)
          .single();

        if (!error && versionData?.id) {
          setCurrentVersionId(versionData.id);
        }
      };
      
      fetchLatestVersion();
    }
  }, [selectedDocument]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          uploader:profiles!uploaded_by (
            name,
            email
          )
        `)
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        showToast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive"
        });
        return;
      }

      const mappedDocuments = data ? await Promise.all(data.map(async (dbDoc) => {
        // Get the latest version ID for each document
        const { data: versionData } = await supabase
          .from('document_versions')
          .select('id')
          .eq('document_id', dbDoc.id)
          .order('version_number', { ascending: false })
          .limit(1)
          .single();

        return {
          ...mapToDocument(dbDoc),
          latestVersionId: versionData?.id
        };
      })) : [];
      
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
      // First check if we have existing extracted text
      const { data: versionData, error: versionError } = await supabase
        .from('document_versions')
        .select('id, text_content, storage_path, type')
        .eq('document_id', document.id)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      if (versionError) {
        console.error('Error getting document version:', versionError);
        setDocumentPreview('Unable to load document. Please try again.');
        return;
      }

      // If we already have extracted text, use it
      if (versionData.text_content) {
        const textContent = convertToDisplayText(versionData.text_content);
        setDocumentPreview(textContent);
        return;
      }

      // Otherwise, extract text from the file
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

      // Download the file for text extraction
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('deal_documents')
        .download(fullStoragePath);

      if (downloadError || !fileData) {
        console.error('Error downloading file:', downloadError);
        setDocumentPreview('Unable to download document for preview. The file may be missing.');
        return;
      }

      // Convert file to base64 for text extraction
      const arrayBuffer = await fileData.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // Call text-extractor edge function
      const { data: extractResult, error: extractError } = await supabase.functions.invoke('text-extractor', {
        body: {
          fileBase64: base64,
          mimeType: versionData.type || document.type,
          fileName: document.name
        }
      });

      if (extractError || !extractResult?.success) {
        console.error('Text extraction failed:', extractError || extractResult?.error);
        setDocumentPreview(
          `Unable to extract text from this document type (${document.type || 'unknown'}).\n\n` +
          `This could be due to:\n` +
          `• Unsupported file format\n` +
          `• Password-protected document\n` +
          `• Corrupted file\n` +
          `• Large file size\n\n` +
          `Click "Open in new tab" to view the original file.`
        );
        return;
      }

      const extractedText = convertToDisplayText(extractResult.text);
      
      // Save extracted text for future use - ensure we're saving a string
      if (typeof extractedText === 'string' && versionData?.id) {
        await supabase
          .from('document_versions')
          .update({ text_content: extractedText })
          .eq('id', versionData.id);
      }

      setDocumentPreview(extractedText);

    } catch (error) {
      console.error('Error fetching document preview:', error);
      setDocumentPreview('Error loading document preview. The document file may be missing or corrupted.');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Helper function to convert any content to displayable text
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convertToDisplayText = (content: any): string => {
    if (!content) return 'No content available';
    
    if (typeof content === 'string') {
      // If it's already a string, return it
      return content;
    }
    
    if (typeof content === 'object' && content !== null) {
      // If it's an object, stringify it nicely
      return JSON.stringify(content, null, 2);
    }
    
    // For any other type, convert to string
    return String(content);
  };

  const handleOpenDocumentInNewTab = async (document: Document) => {
    try {
      const { data: storageData, error: storageError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', document.id)
        .single();

      if (storageError || !storageData?.storage_path) {
        showToast({
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
          showToast({
            title: "Document Not Found",
            description: "The document file is missing from storage. Please re-upload the document.",
            variant: "destructive"
          });
        } else {
          showToast({
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
      showToast({
        title: "Error",
        description: "Failed to open document. The file may be missing or corrupted.",
        variant: "destructive"
      });
    }
  };

  // State for document analysis modal
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [currentAnalysisType, setCurrentAnalysisType] = useState<'summary' | 'key_terms' | 'risks'>('summary');

  const handleAnalyzeDocument = async (type: 'summary' | 'key_terms' | 'risks') => {
    if (!selectedDocument) {
      toast.error("Please select a document first");
      return;
    }

    // Set the analysis type and open the modal
    setCurrentAnalysisType(type);
    setShowAnalysisModal(true);
  };

  const handleAddComment = async (content: string) => {
    if (!currentVersionId) return;
    
    try {
      await addComment({ content });
      setShowCommentForm(false);
      showToast({
        title: "Success",
        description: "Comment added successfully"
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
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
    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
      {/* Left Panel - Document List */}
      <div className="flex-1 lg:max-w-sm h-full">
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
      <div className="flex-1 lg:flex-[2] h-full">
        <DocumentViewerPanel
          selectedDocument={selectedDocument}
          documentPreview={documentPreview}
          previewLoading={previewLoading}
          comments={comments}
          showCommentForm={showCommentForm}
          isSubmittingComment={isSubmittingComment}
          dealId={dealId}
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
      
      {/* Document Analysis Modal */}
      {selectedDocument && (
        <DocumentAnalysisModal
          isOpen={showAnalysisModal}
          onClose={() => setShowAnalysisModal(false)}
          document={selectedDocument}
          dealId={dealId}
          analysisType={currentAnalysisType}
        />
      )}

      {/* Contract Analyzer Dialog */}
      {selectedDocument && (
        <ContractAnalyzerDialog
          dealId={dealId}
          documentId={selectedDocument.id}
          versionId={selectedDocument.latestVersionId || ''}
          userRole={user?.role || 'user'}
          open={showContractAnalyzer}
          onOpenChange={setShowContractAnalyzer}
        />
      )}
      
    </div>
  );
};

export default DealDocumentsTab;
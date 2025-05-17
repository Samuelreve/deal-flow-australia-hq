
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Document } from "@/types/deal";
import { FileText, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Define props for the DocumentManagement component
interface DocumentManagementProps {
  dealId: string; // The ID of the current deal
  userRole?: string; // The role of the current user
  initialDocuments?: Document[]; // Initial documents to display
}

const DocumentManagement = ({ 
  dealId, 
  userRole = "admin", 
  initialDocuments = [] 
}: DocumentManagementProps) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch documents when component mounts or dealId changes
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        
        // Fetch documents for this deal from Supabase
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('deal_id', dealId)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Transform database document format to our Document type
        if (data) {
          const formattedDocuments: Document[] = await Promise.all(data.map(async doc => {
            // Get a signed URL that expires in 1 hour (3600 seconds)
            const { data: urlData } = await supabase.storage
              .from('deal-documents')
              .createSignedUrl(`${dealId}/${doc.storage_path}`, 3600);
            
            return {
              id: doc.id,
              name: doc.name,
              url: urlData?.signedUrl || '',
              uploadedBy: doc.uploaded_by,
              uploadedAt: new Date(doc.created_at),
              size: doc.size,
              type: doc.type,
              status: doc.status,
              version: doc.version
            };
          }));
          
          setDocuments(formattedDocuments);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast({
          title: "Error",
          description: "Failed to fetch documents. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch if we don't have initial documents
    if (initialDocuments.length === 0) {
      fetchDocuments();
    } else {
      setIsLoading(false);
    }
  }, [dealId, initialDocuments]);

  // Handle file selection from input
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadError(null); // Clear previous errors
    } else {
      setSelectedFile(null);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    
    if (!user) {
      setUploadError('You must be logged in to upload files.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Create a unique filename with user ID to help with permissions
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;
      const storagePath = `${dealId}/${filePath}`;
      
      // 1. Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('deal-documents')
        .upload(storagePath, selectedFile);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // 2. Save document metadata to documents table
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          deal_id: dealId,
          name: selectedFile.name,
          description: '',
          storage_path: filePath,
          uploaded_by: user.id,
          size: selectedFile.size,
          type: selectedFile.type,
          status: "draft",
          version: 1
        })
        .select()
        .single();
      
      if (documentError) {
        throw documentError;
      }
      
      // 3. Get a signed URL for the uploaded file
      const { data: urlData } = await supabase.storage
        .from('deal-documents')
        .createSignedUrl(storagePath, 3600);
      
      // 4. Add the new document to our local state
      const newDocument: Document = {
        id: documentData.id,
        name: documentData.name,
        url: urlData?.signedUrl || '',
        uploadedBy: user.id,
        uploadedAt: new Date(),
        size: selectedFile.size,
        type: selectedFile.type,
        status: "draft",
        version: 1
      };
      
      setDocuments(prevDocuments => [newDocument, ...prevDocuments]);
      
      // Show success message
      toast({
        title: "File uploaded successfully!",
        description: `${selectedFile.name} has been uploaded.`,
      });
      
      // Reset form state
      setSelectedFile(null);
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadError(error.message || 'File upload failed');
      toast({
        title: "Upload failed",
        description: error.message || "There was a problem uploading your file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  // Handle document deletion
  const openDeleteDialog = (document: Document) => {
    setDocumentToDelete(document);
    setShowDeleteDialog(true);
  };
  
  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDocumentToDelete(null);
  };
  
  const confirmDelete = async () => {
    if (!documentToDelete || !user) return;
    
    setIsDeleting(true);
    try {
      // 1. Delete from storage
      const { error: storageError } = await supabase.storage
        .from('deal-documents')
        .remove([`${dealId}/${documentToDelete.id}`]);
      
      if (storageError) {
        console.warn("Storage delete error:", storageError);
        // Continue anyway to clean up database entry
      }
      
      // 2. Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentToDelete.id);
      
      if (dbError) {
        throw dbError;
      }
      
      // 3. Update local state
      setDocuments(prevDocuments => 
        prevDocuments.filter(doc => doc.id !== documentToDelete.id)
      );
      
      toast({
        title: "Document deleted",
        description: `${documentToDelete.name} has been deleted.`,
      });
      
      closeDeleteDialog();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "There was a problem deleting the file.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Document List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-muted-foreground">Loading documents...</div>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No documents yet</h3>
          <p className="text-muted-foreground mb-4">Upload documents to share with deal participants</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>
                      {new Intl.DateTimeFormat("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      }).format(doc.uploadedAt)}
                    </span>
                    <span className="mx-1">•</span>
                    <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                    {doc.status === "signed" && (
                      <>
                        <span className="mx-1">•</span>
                        <span className="text-green-600">Signed</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">View</a>
                </Button>
                {(userRole === "admin" || doc.uploadedBy === user?.id) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => openDeleteDialog(doc)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Upload Section */}
      <div className="border-t pt-4 mt-4">
        <h4 className="text-lg font-semibold mb-3">Upload New Document</h4>
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 mb-3"
        />

        {selectedFile && (
          <p className="text-sm text-muted-foreground mb-3">
            Selected file: <span className="font-medium">{selectedFile.name}</span>
          </p>
        )}

        {uploadError && (
          <p className="text-sm text-red-600 mb-3">{uploadError}</p>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="mt-2"
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{documentToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentManagement;

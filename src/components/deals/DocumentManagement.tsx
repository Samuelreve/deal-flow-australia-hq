
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Document } from "@/types/deal";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          const formattedDocuments: Document[] = data.map(doc => ({
            id: doc.id,
            name: doc.name,
            url: supabase.storage.from('deal-documents').getPublicUrl(doc.storage_path).data.publicUrl,
            uploadedBy: doc.uploaded_by,
            uploadedAt: new Date(doc.created_at),
            size: doc.size,
            type: doc.type,
            status: doc.status,
            version: doc.version
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

    setUploading(true);
    setUploadError(null);

    try {
      // 1. Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${dealId}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      const { data: fileData, error: fileError } = await supabase.storage
        .from('deal-documents')
        .upload(fileName, selectedFile);
      
      if (fileError) {
        throw fileError;
      }
      
      // 2. Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('deal-documents')
        .getPublicUrl(fileName);
      
      const publicUrl = urlData.publicUrl;
      
      // 3. Save document metadata to documents table
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          deal_id: dealId,
          name: selectedFile.name,
          storage_path: fileName,
          uploaded_by: userRole,
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
      
      // 4. Add the new document to our local state
      const newDocument: Document = {
        id: documentData.id,
        name: documentData.name,
        url: publicUrl,
        uploadedBy: documentData.uploaded_by,
        uploadedAt: new Date(documentData.created_at),
        size: documentData.size,
        type: documentData.type,
        status: documentData.status,
        version: documentData.version
      };
      
      setDocuments(prevDocuments => [newDocument, ...prevDocuments]);
      
      // Show success message
      toast({
        title: "File uploaded successfully!",
        description: `${selectedFile.name} has been uploaded.`,
      });
      
      // Reset form state
      setSelectedFile(null);
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
                {userRole === "admin" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Delete
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
    </div>
  );
};

export default DocumentManagement;

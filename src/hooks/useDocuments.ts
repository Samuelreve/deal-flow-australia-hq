
import { useState, useEffect } from "react";
import { Document } from "@/types/deal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

export const useDocuments = (dealId: string, initialDocuments: Document[] = []) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  const uploadDocument = async (file: File, category: string) => {
    if (!user) {
      throw new Error('You must be logged in to upload files.');
    }

    setUploading(true);

    try {
      // Create a unique filename with user ID to help with permissions
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;
      const storagePath = `${dealId}/${filePath}`;
      
      // 1. Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('deal-documents')
        .upload(storagePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // 2. Save document metadata to documents table
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          deal_id: dealId,
          name: file.name,
          description: '',
          storage_path: filePath,
          uploaded_by: user.id,
          size: file.size,
          type: file.type,
          status: "draft",
          version: 1,
          category: category // Store the document category
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
        size: file.size,
        type: file.type,
        status: "draft",
        version: 1,
        category: category // Include category in the new document object
      };
      
      setDocuments(prevDocuments => [newDocument, ...prevDocuments]);
      
      // Show success message
      toast({
        title: "File uploaded successfully!",
        description: `${file.name} has been uploaded.`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "There was a problem uploading your file.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (document: Document) => {
    try {
      // 1. Delete from storage
      const { error: storageError } = await supabase.storage
        .from('deal-documents')
        .remove([`${dealId}/${document.id}`]);
      
      if (storageError) {
        console.warn("Storage delete error:", storageError);
        // Continue anyway to clean up database entry
      }
      
      // 2. Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);
      
      if (dbError) {
        throw dbError;
      }
      
      // 3. Update local state
      setDocuments(prevDocuments => 
        prevDocuments.filter(doc => doc.id !== document.id)
      );
      
      toast({
        title: "Document deleted",
        description: `${document.name} has been deleted.`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "There was a problem deleting the file.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    documents,
    isLoading,
    uploading,
    uploadDocument,
    deleteDocument
  };
};

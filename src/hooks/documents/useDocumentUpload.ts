
import { useState } from "react";
import { Document } from "@/types/documentVersion";
import { useToast } from "@/components/ui/use-toast";

interface UploadDocumentOptions {
  file: File;
  dealId: string;
  documentType: string;
  onProgress?: (progress: number) => void;
}

/**
 * Hook for document upload functionality 
 */
export const useDocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  /**
   * Upload a document to the system
   */
  const uploadDocument = async (options: UploadDocumentOptions): Promise<Document | null> => {
    const { file, dealId, documentType, onProgress } = options;
    
    setUploading(true);
    try {
      // For demonstration purposes, we're simulating an upload
      // In production, this would connect to your backend service
      
      // Simulate progress updates
      if (onProgress) {
        const interval = setInterval(() => {
          const progress = Math.floor(Math.random() * 100);
          onProgress(progress);
          if (progress === 100) clearInterval(interval);
        }, 500);
        
        // Clear the interval after 2 seconds
        setTimeout(() => {
          clearInterval(interval);
          onProgress(100);
        }, 2000);
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Return a mock document
      return {
        id: `doc-${Date.now()}`,
        name: file.name,
        category: documentType,
        type: file.type,
        uploadedBy: 'current-user',
        latestVersionId: `ver-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };
  
  return {
    uploading,
    uploadDocument
  };
};

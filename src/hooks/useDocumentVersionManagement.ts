
import { useState } from "react";
import { versionTaggingService } from "@/services/documents/version-management/versionTaggingService";
import { versionAnnotationService } from "@/services/documents/version-management/versionAnnotationService";
import { DocumentVersionTag } from "@/types/documentVersion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

/**
 * Hook for managing document version tags and annotations
 */
export const useDocumentVersionManagement = (
  dealId: string,
  documentId: string,
  onVersionsUpdated?: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * Add a tag to a document version
   */
  const addVersionTag = async (
    versionId: string, 
    tag: { name: string, color: string }
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add tags.",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      const result = await versionTaggingService.addVersionTag(
        tag, 
        versionId,
        dealId  // Added dealId parameter
      );
      
      if (result) {
        toast({
          title: "Tag Added",
          description: "Version tag has been added successfully."
        });
        
        if (onVersionsUpdated) {
          onVersionsUpdated();
        }
      }
      
      return result;
    } catch (error: any) {
      console.error("Error adding tag:", error);
      toast({
        title: "Failed to Add Tag",
        description: error.message || "There was an error adding the tag.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove a tag from a document version
   */
  const removeVersionTag = async (versionId: string, tagId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to remove tags.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    try {
      const success = await versionTaggingService.removeVersionTag(tagId, versionId);
      
      if (success) {
        toast({
          title: "Tag Removed",
          description: "Version tag has been removed successfully."
        });
        
        if (onVersionsUpdated) {
          onVersionsUpdated();
        }
      }
      
      return success;
    } catch (error: any) {
      console.error("Error removing tag:", error);
      toast({
        title: "Failed to Remove Tag",
        description: error.message || "There was an error removing the tag.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add an annotation to a document version
   */
  const addVersionAnnotation = async (
    versionId: string,
    annotationContent: { content: string }
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add annotations.",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      const result = await versionAnnotationService.addVersionAnnotation(
        annotationContent,
        versionId,
        dealId  // Added dealId parameter
      );
      
      if (result) {
        toast({
          title: "Annotation Added",
          description: "Version annotation has been added successfully."
        });
        
        if (onVersionsUpdated) {
          onVersionsUpdated();
        }
      }
      
      return result;
    } catch (error: any) {
      console.error("Error adding annotation:", error);
      toast({
        title: "Failed to Add Annotation",
        description: error.message || "There was an error adding the annotation.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    addVersionTag,
    removeVersionTag,
    addVersionAnnotation
  };
};

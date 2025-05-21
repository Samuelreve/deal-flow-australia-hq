
import { useState } from "react";
import { DocumentVersion, VersionComparisonResult, DocumentVersionTag, DocumentVersionAnnotation } from "@/types/documentVersion";
import { documentVersionManagementService } from "@/services/documents/documentVersionManagementService";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useDocumentVersionManagement = (dealId: string) => {
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState<VersionComparisonResult | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [addingAnnotation, setAddingAnnotation] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  /**
   * Compare two document versions
   */
  const compareVersions = async (version1Id: string, version2Id: string) => {
    setComparing(true);
    try {
      const result = await documentVersionManagementService.compareVersions(version1Id, version2Id, dealId);
      setComparison(result);
      return result;
    } catch (error: any) {
      console.error("Error comparing versions:", error);
      toast({
        title: "Error",
        description: "Failed to compare document versions: " + error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setComparing(false);
    }
  };
  
  /**
   * Restore a document version to make it the latest version
   */
  const restoreVersion = async (version: DocumentVersion, documentId: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to restore document versions.",
        variant: "destructive",
      });
      return null;
    }
    
    setRestoring(true);
    try {
      const result = await documentVersionManagementService.restoreVersion(
        version,
        documentId,
        dealId,
        user.id
      );
      
      if (result) {
        toast({
          title: "Version Restored",
          description: `Version ${version.versionNumber} has been restored as the latest version.`,
        });
      }
      
      return result;
    } catch (error: any) {
      console.error("Error restoring version:", error);
      toast({
        title: "Error",
        description: "Failed to restore document version: " + error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setRestoring(false);
    }
  };
  
  /**
   * Add a tag to a document version
   */
  const addVersionTag = async (versionId: string, name: string, color: string) => {
    setAddingTag(true);
    try {
      const result = await documentVersionManagementService.addVersionTag(versionId, name, color);
      
      if (result) {
        toast({
          title: "Tag Added",
          description: `Tag "${name}" has been added to the version.`,
        });
      }
      
      return result;
    } catch (error: any) {
      console.error("Error adding tag:", error);
      toast({
        title: "Error",
        description: "Failed to add tag: " + error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setAddingTag(false);
    }
  };
  
  /**
   * Add an annotation to a document version
   */
  const addVersionAnnotation = async (versionId: string, content: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to add annotations.",
        variant: "destructive",
      });
      return null;
    }
    
    setAddingAnnotation(true);
    try {
      const result = await documentVersionManagementService.addVersionAnnotation(
        versionId,
        user.id,
        content
      );
      
      if (result) {
        toast({
          title: "Annotation Added",
          description: "Your annotation has been added to the version.",
        });
      }
      
      return result;
    } catch (error: any) {
      console.error("Error adding annotation:", error);
      toast({
        title: "Error",
        description: "Failed to add annotation: " + error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setAddingAnnotation(false);
    }
  };
  
  return {
    comparing,
    comparison,
    restoring,
    addingTag,
    addingAnnotation,
    compareVersions,
    restoreVersion,
    addVersionTag,
    addVersionAnnotation
  };
};

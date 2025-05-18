
import { Document } from "@/types/deal";
import { documentDatabaseService } from "./documentDatabaseService";
import { documentStorageService } from "./documentStorageService";

/**
 * Service responsible for document deletion operations
 */
export const documentDeleteService = {
  /**
   * Delete a document
   */
  async deleteDocument(document: Document, dealId: string): Promise<boolean> {
    try {
      // 1. Get all versions to delete their files
      const versions = await documentDatabaseService.fetchDocumentVersions(document.id);
      
      // 2. Delete version files from storage
      for (const version of versions) {
        await documentStorageService.deleteFile(version.storage_path, dealId);
      }
      
      // 3. Delete original file if it exists (for backward compatibility)
      if (document.url) {
        const originalPath = document.url.split('/').pop();
        if (originalPath) {
          await documentStorageService.deleteFile(originalPath, dealId);
        }
      }
      
      // 4. Delete from database (this will cascade to delete versions)
      await documentDatabaseService.deleteDocumentMetadata(document.id);
      
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }
};

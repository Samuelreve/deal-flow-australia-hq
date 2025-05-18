
import { DocumentVersion } from "@/types/deal";
import { documentDatabaseService } from "./documentDatabaseService";
import { documentStorageService } from "./documentStorageService";
import { documentMapperService } from "./documentMapperService";
import { supabase } from "@/integrations/supabase/client";

/**
 * Service responsible for managing document versions
 */
export const documentVersionService = {
  /**
   * Get all versions for a document
   */
  async getDocumentVersions(dealId: string, documentId: string): Promise<DocumentVersion[]> {
    try {
      const versionsMetadata = await documentDatabaseService.fetchDocumentVersions(documentId);
      
      return await Promise.all(
        versionsMetadata.map(version => 
          documentMapperService.mapToDocumentVersion(version, dealId, documentId)
        )
      );
    } catch (error) {
      console.error("Error fetching document versions:", error);
      throw error;
    }
  },

  /**
   * Add a new version to an existing document
   */
  async addDocumentVersion(
    file: File, 
    dealId: string, 
    documentId: string, 
    userId: string, 
    description: string = ''
  ) {
    try {
      // 1. Get the existing document and its versions to determine next version number
      const { data: versions } = await supabase
        .from('document_versions')
        .select('version_number')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })
        .limit(1);
      
      const nextVersionNumber = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;
      
      // 2. Upload file to storage with version info in path
      const filePath = await documentStorageService.uploadVersionFile(
        file, dealId, documentId, nextVersionNumber, userId
      );
      
      // 3. Save version metadata
      const versionData = await documentDatabaseService.saveDocumentVersion({
        document_id: documentId,
        version_number: nextVersionNumber,
        storage_path: filePath,
        size: file.size,
        type: file.type,
        uploaded_by: userId,
        description: description || `Version ${nextVersionNumber}`
      });
      
      // 4. Get updated document and map to domain model
      const { data: documentData } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();
      
      if (!documentData) {
        throw new Error('Document not found');
      }
      
      return await documentMapperService.mapToDocument(documentData, dealId);
    } catch (error) {
      console.error("Error adding document version:", error);
      throw error;
    }
  },

  /**
   * Delete a specific version of a document
   */
  async deleteDocumentVersion(
    versionId: string, 
    documentId: string, 
    dealId: string, 
    storagePath: string
  ): Promise<boolean> {
    try {
      // 1. Delete the version file from storage
      await documentStorageService.deleteFile(storagePath, dealId);
      
      // 2. Delete the version from the database
      await documentDatabaseService.deleteDocumentVersion(versionId, documentId);
      
      return true;
    } catch (error) {
      console.error("Error deleting document version:", error);
      throw error;
    }
  }
};

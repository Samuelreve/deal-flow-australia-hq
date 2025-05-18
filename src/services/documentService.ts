import { Document, DocumentVersion } from "@/types/deal";
import { documentDatabaseService } from "./documents/documentDatabaseService";
import { documentStorageService } from "./documents/documentStorageService";
import { documentMapperService } from "./documents/documentMapperService";

/**
 * Main document service that orchestrates operations between storage and database
 */
export const documentService = {
  /**
   * Get all documents for a deal
   */
  async getDocuments(dealId: string): Promise<Document[]> {
    try {
      const documentsMetadata = await documentDatabaseService.fetchDocuments(dealId);
      
      return await Promise.all(
        documentsMetadata.map(doc => documentMapperService.mapToDocument(doc, dealId))
      );
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  },

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
   * Upload a document (first version or new version)
   */
  async uploadDocument(
    file: File, 
    category: string, 
    dealId: string, 
    userId: string, 
    documentId?: string
  ): Promise<Document> {
    try {
      // If documentId is provided, add a new version to an existing document
      if (documentId) {
        return await this.addDocumentVersion(file, dealId, documentId, userId);
      }
      
      // Otherwise, create a new document with its first version
      // 1. Upload file to storage
      const filePath = await documentStorageService.uploadFile(file, dealId, userId);
      
      // 2. Save metadata to database
      const documentData = await documentDatabaseService.saveDocumentMetadata({
        deal_id: dealId,
        name: file.name,
        description: '',
        storage_path: filePath,
        uploaded_by: userId,
        size: file.size,
        type: file.type,
        status: "draft",
        version: 1,
        milestone_id: null,
        category
      });
      
      // 3. Create initial version record
      const versionData = await documentDatabaseService.saveDocumentVersion({
        document_id: documentData.id,
        version_number: 1,
        storage_path: filePath,
        size: file.size,
        type: file.type,
        uploaded_by: userId,
        description: 'Initial version'
      });
      
      // 4. Map to domain model
      return await documentMapperService.mapToDocument({
        ...documentData,
        latest_version_id: versionData.id
      }, dealId);
    } catch (error) {
      console.error("Error uploading document:", error);
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
  ): Promise<Document> {
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

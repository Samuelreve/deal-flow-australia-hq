
import { Document } from "@/types/deal";
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
   * Upload a document
   */
  async uploadDocument(file: File, category: string, dealId: string, userId: string): Promise<Document> {
    try {
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
      
      // 3. Map to domain model
      return await documentMapperService.mapToDocument(documentData, dealId);
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  },

  /**
   * Delete a document
   */
  async deleteDocument(document: Document, dealId: string): Promise<boolean> {
    try {
      // 1. Delete from storage
      await documentStorageService.deleteFile(document.id, dealId);
      
      // 2. Delete from database
      await documentDatabaseService.deleteDocumentMetadata(document.id);
      
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }
};

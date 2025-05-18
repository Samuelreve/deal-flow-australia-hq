
import { Document } from "@/types/deal";
import { documentDatabaseService } from "./documentDatabaseService";
import { documentMapperService } from "./documentMapperService";

/**
 * Service responsible for retrieving documents
 */
export const documentRetrievalService = {
  /**
   * Get all documents for a deal
   * Note: RLS policies at the database level ensure users only see documents from deals they participate in
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
   * Verify if a user has access to a document
   */
  async verifyDocumentAccess(documentId: string, userId: string): Promise<boolean> {
    try {
      const result = await documentDatabaseService.checkDocumentAccess(documentId, userId);
      return result;
    } catch (error) {
      console.error("Error checking document access:", error);
      return false;
    }
  }
};


import { Document } from "@/types/deal";
import { documentDatabaseService } from "./documentDatabaseService";
import { documentMapperService } from "./documentMapperService";

/**
 * Service responsible for retrieving documents
 */
export const documentRetrievalService = {
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
  }
};

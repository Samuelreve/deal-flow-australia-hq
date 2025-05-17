
import { Document } from "@/types/deal";
import { DocumentMetadata } from "./documentDatabaseService";
import { documentStorageService } from "./documentStorageService";

/**
 * Service responsible for mapping between database entities and domain models
 */
export const documentMapperService = {
  /**
   * Map a document metadata object from the database to a Document domain object
   */
  async mapToDocument(metadata: DocumentMetadata, dealId: string): Promise<Document> {
    // Get a signed URL for the document
    const signedUrl = await documentStorageService.createSignedUrl(
      dealId, 
      metadata.storage_path
    );
    
    return {
      id: metadata.id,
      name: metadata.name,
      url: signedUrl || '',
      uploadedBy: metadata.uploaded_by,
      uploadedAt: new Date(metadata.created_at),
      size: metadata.size,
      type: metadata.type,
      status: metadata.status,
      version: metadata.version,
      category: metadata.category || undefined
    };
  }
};

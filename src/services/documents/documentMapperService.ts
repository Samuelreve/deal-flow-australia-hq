
import { Document, DocumentVersion } from "@/types/deal";
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
    // Get a signed URL for the document's latest version
    const latestVersionId = metadata.latest_version_id;
    let signedUrl = '';
    let versions: DocumentVersion[] = [];
    
    if (latestVersionId) {
      // Get the latest version data
      const { data: latestVersionData } = await documentStorageService.getSignedUrlForVersion(
        dealId,
        metadata.id,
        latestVersionId
      );
      
      if (latestVersionData) {
        signedUrl = latestVersionData.signedUrl || '';
      }
    } else {
      // Fallback to the old method for documents without versions
      signedUrl = await documentStorageService.createSignedUrl(
        dealId, 
        metadata.storage_path
      ) || '';
    }
    
    return {
      id: metadata.id,
      name: metadata.name,
      url: signedUrl,
      uploadedBy: metadata.uploaded_by,
      uploadedAt: new Date(metadata.created_at),
      size: metadata.size,
      type: metadata.type,
      status: metadata.status,
      version: metadata.version,
      category: metadata.category || undefined,
      latestVersionId: metadata.latest_version_id || undefined
    };
  },

  /**
   * Map a database version to a DocumentVersion domain object
   */
  async mapToDocumentVersion(
    version: any, 
    dealId: string, 
    documentId: string
  ): Promise<DocumentVersion> {
    // Get a signed URL for this version
    const { data } = await documentStorageService.getSignedUrlForVersion(dealId, documentId, version.id);
    
    return {
      id: version.id,
      documentId: version.document_id,
      versionNumber: version.version_number,
      url: data?.signedUrl || '',
      uploadedBy: version.uploaded_by,
      uploadedAt: new Date(version.uploaded_at),
      size: version.size,
      type: version.type,
      description: version.description
    };
  }
};


import { Document } from "@/types/deal";

/**
 * Service for mapping database records to Document types
 */
export class DocumentMapperService {
  /**
   * Map database records to Document type
   */
  mapToDocument(documentData: any, versionData?: any): Document {
    return {
      id: documentData.id,
      name: documentData.name,
      url: documentData.storage_path || '', // Use storage_path from database
      uploadedBy: documentData.uploaded_by,
      uploadedAt: new Date(documentData.created_at),
      size: documentData.size,
      type: documentData.type,
      status: documentData.status || "draft",
      version: documentData.version || 1,
      category: documentData.category,
      latestVersionId: documentData.latest_version_id,
      latestVersion: versionData ? {
        id: versionData.id,
        documentId: versionData.document_id,
        versionNumber: versionData.version_number,
        url: versionData.storage_path || '', // Use storage_path from database
        uploadedBy: versionData.uploaded_by,
        uploadedAt: new Date(versionData.created_at),
        size: versionData.size,
        type: versionData.type,
        description: versionData.description
      } : undefined,
      versions: [],
      comments: []
    };
  }
}

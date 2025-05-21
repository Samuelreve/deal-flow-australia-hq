
import { Document as DealDocument } from "@/types/deal";
import { Document as VersionDocument } from "@/types/documentVersion";

/**
 * Adapter function to convert between Document types
 * This resolves type conflicts between document types in different modules
 */
export const adaptDocumentToDealType = (doc: VersionDocument): DealDocument => {
  return {
    id: doc.id,
    name: doc.name,
    url: doc.latestVersion?.url || "",
    uploadedBy: doc.uploadedBy || "",
    uploadedAt: new Date(doc.createdAt || new Date()),
    size: doc.latestVersion?.size || 0,
    type: doc.type || "",
    status: "draft",
    version: 1,
    category: doc.category,
    latestVersionId: doc.latestVersionId,
    latestVersion: doc.latestVersion,
  };
};

export const adaptDocumentsToDealType = (docs: VersionDocument[]): DealDocument[] => {
  return docs.map(adaptDocumentToDealType);
};

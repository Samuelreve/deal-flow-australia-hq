
import { Document as DealDocument } from "@/types/deal";
import { Document as VersionDocument } from "@/types/documentVersion";
import { formatBytes } from "@/lib/formatBytes";

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
    category: doc.category || "Other",
    latestVersionId: doc.latestVersionId,
    latestVersion: doc.latestVersion,
    // Add missing properties from DealDocument that may be required
    versions: doc.latestVersion ? [doc.latestVersion] : [],
    comments: []
  };
};

export const adaptDocumentsToDealType = (docs: VersionDocument[]): DealDocument[] => {
  return docs.map(adaptDocumentToDealType);
};

/**
 * Function to format document file size
 */
export const formatDocumentSize = (size: number): string => {
  return formatBytes(size);
};

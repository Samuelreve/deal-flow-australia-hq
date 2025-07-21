
import { Document } from "@/types/deal";

export interface UploadOptions {
  file: File;
  dealId: string;
  category: string;
  userId: string;
  documentId?: string;
  documentName?: string;
  milestoneId?: string;
  onProgress?: (progress: number) => void;
}

export interface DocumentCreationResult {
  document: any;
  version: any;
}

export interface StorageUploadResult {
  filePath: string;
}

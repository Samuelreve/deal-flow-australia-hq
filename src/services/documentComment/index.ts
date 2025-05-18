
// Re-export all document comment service functionality
export * from "./types";
export * from "./mappers";
export * from "./commentRetrievalService";
export * from "./commentMutationService";

// Export a combined service object with all functionality
import { commentRetrievalService } from "./commentRetrievalService";
import { commentMutationService } from "./commentMutationService";

export const documentCommentService = {
  ...commentRetrievalService,
  ...commentMutationService
};

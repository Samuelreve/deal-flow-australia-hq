
import { 
  versionComparisonService, 
  versionRestoreService, 
  versionTaggingService, 
  versionAnnotationService,
  versionContentService
} from './version-management';

/**
 * Service responsible for document version management operations
 * This service serves as a facade to the specialized services
 */
export const documentVersionManagementService = {
  /**
   * Compare two document versions and return differences
   */
  compareVersions: versionComparisonService.compareVersions.bind(versionComparisonService),

  /**
   * Get text content of a document version
   */
  getVersionTextContent: versionContentService.getVersionTextContent,

  /**
   * Restore a document version (make it the latest version)
   */
  restoreVersion: versionRestoreService.restoreVersion,

  /**
   * Add a tag to a document version
   */
  addVersionTag: versionTaggingService.addVersionTag,

  /**
   * Remove a tag from a document version
   */
  removeVersionTag: versionTaggingService.removeVersionTag,

  /**
   * Add an annotation to a document version
   */
  addVersionAnnotation: versionAnnotationService.addVersionAnnotation
};

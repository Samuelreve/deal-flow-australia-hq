import { supabase } from "@/integrations/supabase/client";

/**
 * Service for cleaning up document storage inconsistencies
 */
export const documentCleanupService = {
  /**
   * Delete all documents for a deal from both database and storage
   */
  async deleteAllDocumentsForDeal(dealId: string): Promise<void> {
    try {
      console.log(`Starting cleanup for deal: ${dealId}`);

      // Get all documents and versions for this deal
      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select(`
          id,
          name,
          storage_path,
          document_versions (
            id,
            storage_path
          )
        `)
        .eq('deal_id', dealId);

      if (docsError) {
        console.error('Error fetching documents:', docsError);
        throw new Error(`Failed to fetch documents: ${docsError.message}`);
      }

      if (!documents || documents.length === 0) {
        console.log('No documents found for cleanup');
        return;
      }

      console.log(`Found ${documents.length} documents to clean up`);

      // Collect all storage paths that need to be deleted
      const storagePathsToDelete: string[] = [];
      const buckets = ['deal_documents', 'Documents', 'Deal Documents', 'contracts'];

      for (const doc of documents) {
        // Add document storage path
        if (doc.storage_path) {
          // Try different path combinations
          storagePathsToDelete.push(doc.storage_path);
          storagePathsToDelete.push(`${dealId}/${doc.storage_path}`);
        }

        // Add version storage paths
        if (doc.document_versions && Array.isArray(doc.document_versions)) {
          for (const version of doc.document_versions) {
            if (version.storage_path) {
              storagePathsToDelete.push(version.storage_path);
              storagePathsToDelete.push(`${dealId}/${version.storage_path}`);
            }
          }
        }
      }

      // Remove duplicates
      const uniquePaths = [...new Set(storagePathsToDelete)];
      console.log(`Attempting to delete ${uniquePaths.length} unique storage paths`);

      // Try to delete from all possible buckets
      for (const bucket of buckets) {
        try {
          const { error: storageError } = await supabase.storage
            .from(bucket)
            .remove(uniquePaths);
          
          if (storageError) {
            console.warn(`Storage delete error for bucket ${bucket}:`, storageError);
          } else {
            console.log(`Successfully deleted files from bucket: ${bucket}`);
          }
        } catch (error) {
          console.warn(`Error accessing bucket ${bucket}:`, error);
        }
      }

      // Delete document comments first (due to foreign key constraints)
      const versionIds = documents.flatMap(doc => 
        Array.isArray(doc.document_versions) ? doc.document_versions.map(v => v.id) : []
      );
      
      if (versionIds.length > 0) {
        const { error: commentsError } = await supabase
          .from('document_comments')
          .delete()
          .in('document_version_id', versionIds);

        if (commentsError) {
          console.warn('Error deleting document comments:', commentsError);
        }
      }

      // Delete document analyses
      const { error: analysesError } = await supabase
        .from('document_analyses')
        .delete()
        .in('document_id', documents.map(doc => doc.id));

      if (analysesError) {
        console.warn('Error deleting document analyses:', analysesError);
      }

      // Delete document versions
      const { error: versionsError } = await supabase
        .from('document_versions')
        .delete()
        .in('document_id', documents.map(doc => doc.id));

      if (versionsError) {
        console.error('Error deleting document versions:', versionsError);
        throw new Error(`Failed to delete document versions: ${versionsError.message}`);
      }

      // Delete documents
      const { error: documentsError } = await supabase
        .from('documents')
        .delete()
        .eq('deal_id', dealId);

      if (documentsError) {
        console.error('Error deleting documents:', documentsError);
        throw new Error(`Failed to delete documents: ${documentsError.message}`);
      }

      console.log(`Successfully cleaned up all documents for deal: ${dealId}`);
    } catch (error) {
      console.error('Cleanup failed:', error);
      throw error;
    }
  }
};
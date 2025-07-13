import { supabase } from "@/integrations/supabase/client";

export const migrateDocumentPaths = async () => {
  try {
    console.log('Starting document path migration...');
    
    const { data, error } = await supabase.functions.invoke('migrate-document-paths', {
      method: 'POST'
    });

    if (error) {
      console.error('Migration error:', error);
      throw error;
    }

    console.log('Migration completed:', data);
    return data;
  } catch (error) {
    console.error('Failed to migrate document paths:', error);
    throw error;
  }
};

// Auto-run migration once
if (typeof window !== 'undefined') {
  setTimeout(() => {
    migrateDocumentPaths().catch(console.error);
  }, 2000);
}
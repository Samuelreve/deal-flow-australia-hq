
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types/deal";

// Define the type for the document data returned from Supabase
export interface SupabaseDocumentData {
  id: string;
  deal_id: string;
  name: string;
  description: string | null;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  size: number;
  type: string;
  status: "draft" | "final" | "signed";
  version: number;
  milestone_id: string | null;
  category?: string;
}

export const documentService = {
  async getDocuments(dealId: string): Promise<Document[]> {
    // Fetch documents for this deal from Supabase
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Transform database document format to our Document type
    if (data) {
      return await Promise.all((data as SupabaseDocumentData[]).map(async doc => {
        // Get a signed URL that expires in 1 hour (3600 seconds)
        const { data: urlData } = await supabase.storage
          .from('deal-documents')
          .createSignedUrl(`${dealId}/${doc.storage_path}`, 3600);
        
        return {
          id: doc.id,
          name: doc.name,
          url: urlData?.signedUrl || '',
          uploadedBy: doc.uploaded_by,
          uploadedAt: new Date(doc.created_at),
          size: doc.size,
          type: doc.type,
          status: doc.status,
          version: doc.version,
          category: doc.category
        };
      }));
    }
    return [];
  },

  async uploadDocument(file: File, category: string, dealId: string, userId: string): Promise<Document> {
    // Create a unique filename with user ID to help with permissions
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}-${Date.now()}.${fileExt}`;
    const storagePath = `${dealId}/${filePath}`;
    
    // 1. Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('deal-documents')
      .upload(storagePath, file);
    
    if (uploadError) {
      throw uploadError;
    }
    
    // 2. Save document metadata to documents table
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .insert({
        deal_id: dealId,
        name: file.name,
        description: '',
        storage_path: filePath,
        uploaded_by: userId,
        size: file.size,
        type: file.type,
        status: "draft",
        version: 1,
        category: category
      })
      .select()
      .single();
    
    if (documentError) {
      throw documentError;
    }
    
    // 3. Get a signed URL for the uploaded file
    const { data: urlData } = await supabase.storage
      .from('deal-documents')
      .createSignedUrl(storagePath, 3600);
    
    // 4. Return the new document
    return {
      id: documentData.id,
      name: documentData.name,
      url: urlData?.signedUrl || '',
      uploadedBy: userId,
      uploadedAt: new Date(),
      size: file.size,
      type: file.type,
      status: "draft",
      version: 1,
      category: category
    };
  },

  async deleteDocument(document: Document, dealId: string): Promise<boolean> {
    // 1. Delete from storage
    const { error: storageError } = await supabase.storage
      .from('deal-documents')
      .remove([`${dealId}/${document.id}`]);
    
    if (storageError) {
      console.warn("Storage delete error:", storageError);
      // Continue anyway to clean up database entry
    }
    
    // 2. Delete from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', document.id);
    
    if (dbError) {
      throw dbError;
    }
    
    return true;
  }
};

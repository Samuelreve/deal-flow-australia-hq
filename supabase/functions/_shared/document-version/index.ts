
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.17.0";

export async function addDocumentVersionTag(
  supabaseClient: any, 
  versionId: string, 
  name: string, 
  color: string
) {
  const { data, error } = await supabaseClient
    .from('document_version_tags')
    .insert({
      version_id: versionId,
      name,
      color
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function removeDocumentVersionTag(
  supabaseClient: any,
  tagId: string
) {
  const { error } = await supabaseClient
    .from('document_version_tags')
    .delete()
    .eq('id', tagId);
  
  if (error) throw error;
  return true;
}

export async function addDocumentVersionAnnotation(
  supabaseClient: any,
  versionId: string,
  userId: string,
  content: string
) {
  const { data, error } = await supabaseClient
    .from('document_version_annotations')
    .insert({
      version_id: versionId,
      user_id: userId,
      content
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}


// Shared RBAC (Role-Based Access Control) utilities for Edge Functions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { User } from "https://esm.sh/@supabase/supabase-js@2.21.0";

/**
 * Get Supabase admin client with service role
 */
export function getSupabaseAdmin() {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Verify user authentication from token
 */
export async function verifyAuth(token: string): Promise<User> {
  const supabaseAdmin = getSupabaseAdmin();
  
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) {
    throw new Error("Unauthorized: Invalid or expired token");
  }
  
  return user;
}

/**
 * Verify user is a participant in a deal
 */
export async function verifyDealParticipant(userId: string, dealId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  
  const { count, error } = await supabaseAdmin
    .from('deal_participants')
    .select('*', { count: 'exact', head: true })
    .eq('deal_id', dealId)
    .eq('user_id', userId);
    
  if (error) {
    throw new Error(`Error checking deal participation: ${error.message}`);
  }
  
  if (count === 0) {
    throw new Error("Forbidden: User is not a participant in this deal");
  }
  
  return true;
}

/**
 * Get user's role in a deal
 */
export async function getUserDealRole(userId: string, dealId: string): Promise<string> {
  const supabaseAdmin = getSupabaseAdmin();
  
  const { data, error } = await supabaseAdmin
    .from('deal_participants')
    .select('role')
    .eq('deal_id', dealId)
    .eq('user_id', userId)
    .single();
    
  if (error || !data) {
    throw new Error(`Error fetching user role: ${error?.message || "User not found in deal"}`);
  }
  
  return data.role;
}

/**
 * Check if a deal allows document operations based on its status
 */
export async function checkDealAllowsDocOperations(dealId: string): Promise<{
  allowsDelete: boolean;
  dealStatus: string;
}> {
  const supabaseAdmin = getSupabaseAdmin();
  
  const { data, error } = await supabaseAdmin
    .from('deals')
    .select('status')
    .eq('id', dealId)
    .single();
    
  if (error || !data) {
    throw new Error(`Error fetching deal status: ${error?.message || "Deal not found"}`);
  }
  
  // Define which deal statuses allow document deletion
  // Typically: draft and active deals allow deletion, completed/cancelled don't
  const allowsDelete = ['draft', 'active'].includes(data.status);
  
  return {
    allowsDelete,
    dealStatus: data.status
  };
}

/**
 * Check if user can delete a specific document version
 */
export async function canDeleteDocumentVersion(
  userId: string, 
  versionId: string, 
  dealId: string
): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin();
  
  // First get the version details
  const { data: version, error: versionError } = await supabaseAdmin
    .from('document_versions')
    .select('uploaded_by, document_id')
    .eq('id', versionId)
    .single();
    
  if (versionError || !version) {
    throw new Error(`Version not found: ${versionError?.message || "Not found"}`);
  }
  
  // Check if user is the uploader
  if (version.uploaded_by === userId) {
    return true;
  }
  
  // If not the uploader, check user's role
  const userRole = await getUserDealRole(userId, dealId);
  
  // Only admins and sellers can delete versions they didn't upload
  return ['admin', 'seller'].includes(userRole.toLowerCase());
}

/**
 * Check if user can delete an entire document
 */
export async function canDeleteDocument(
  userId: string,
  documentId: string,
  dealId: string
): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin();
  
  // Get the document details
  const { data: document, error: documentError } = await supabaseAdmin
    .from('documents')
    .select('uploaded_by')
    .eq('id', documentId)
    .single();
    
  if (documentError || !document) {
    throw new Error(`Document not found: ${documentError?.message || "Not found"}`);
  }
  
  // Check if user is the uploader
  if (document.uploaded_by === userId) {
    return true;
  }
  
  // If not the uploader, check user's role
  const userRole = await getUserDealRole(userId, dealId);
  
  // Only admins and sellers can delete documents they didn't upload
  return ['admin', 'seller'].includes(userRole.toLowerCase());
}

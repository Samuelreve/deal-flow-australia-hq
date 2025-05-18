
// Shared milestone RBAC utilities for Edge Functions
import { getSupabaseAdmin } from "./rbac.ts";

/**
 * Verify milestone exists and get its associated deal
 */
export async function verifyMilestoneExists(milestoneId: string): Promise<{
  exists: boolean;
  dealId?: string;
  currentStatus?: string;
  createdById?: string;
}> {
  const supabaseAdmin = getSupabaseAdmin();
  
  const { data, error } = await supabaseAdmin
    .from('milestones')
    .select('id, deal_id, status')
    .eq('id', milestoneId)
    .single();
    
  if (error || !data) {
    console.error(`Milestone not found: ${milestoneId}`, error?.message);
    return { exists: false };
  }
  
  return { 
    exists: true, 
    dealId: data.deal_id,
    currentStatus: data.status,
    createdById: data.created_by_user_id // If you track who created the milestone
  };
}

/**
 * Check if milestone status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: string, 
  newStatus: string,
  userRole: string
): boolean {
  // Define allowed transitions based on current status
  const allowedTransitions: Record<string, string[]> = {
    'not_started': ['in_progress', 'blocked'],
    'in_progress': ['completed', 'blocked'],
    'blocked': ['in_progress'],
    'completed': ['in_progress'] // Only admin can reopen completed milestones
  };
  
  // Check if the transition is allowed
  if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
    return false;
  }
  
  // Special case: Only admin can reopen completed milestones
  if (currentStatus === 'completed' && newStatus === 'in_progress') {
    return userRole.toLowerCase() === 'admin';
  }
  
  return true;
}

/**
 * Check if deal status allows milestone operations
 */
export async function checkDealAllowsMilestoneOperations(dealId: string): Promise<{
  allowsUpdate: boolean;
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
  
  // Define which deal statuses allow milestone operations
  const allowsUpdate = ['draft', 'active', 'pending'].includes(data.status);
  const allowsDelete = ['draft', 'active'].includes(data.status); // More restrictive for deletion
  
  return {
    allowsUpdate,
    allowsDelete,
    dealStatus: data.status
  };
}

/**
 * Get user's role in a deal - utility function reused from rbac.ts
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

// Import these functions from the new authorization module
import { canUpdateMilestone, canDeleteMilestone } from "./milestone-authorization.ts";

// Re-export them to maintain backwards compatibility
export { canUpdateMilestone, canDeleteMilestone };

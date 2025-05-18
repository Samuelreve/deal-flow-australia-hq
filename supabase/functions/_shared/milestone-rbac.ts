
// Shared milestone RBAC utilities for Edge Functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { User } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { getSupabaseAdmin, verifyAuth } from "./rbac.ts";

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
 * Check if user can update milestones in a deal
 */
export async function canUpdateMilestone(
  userId: string,
  milestoneId: string,
  dealId: string,
  newStatus?: string,
  currentStatus?: string
): Promise<{ 
  canUpdate: boolean; 
  reason?: string;
}> {
  const supabaseAdmin = getSupabaseAdmin();
  
  // 1. Get user's role in the deal
  const userRole = await getUserDealRole(userId, dealId);
  
  // 2. Check if role allows milestone updates
  const allowedRoles = ['admin', 'seller', 'lawyer'];
  if (!allowedRoles.includes(userRole.toLowerCase())) {
    return {
      canUpdate: false,
      reason: `Role '${userRole}' cannot update milestones`
    };
  }
  
  // 3. Check if the deal status allows milestone operations
  const { allowsUpdate, dealStatus } = await checkDealAllowsMilestoneOperations(dealId);
  if (!allowsUpdate) {
    return {
      canUpdate: false,
      reason: `Deal status '${dealStatus}' does not allow milestone updates`
    };
  }
  
  // 4. If status change, check if valid transition
  if (newStatus && currentStatus && newStatus !== currentStatus) {
    if (!isValidStatusTransition(currentStatus, newStatus, userRole)) {
      return {
        canUpdate: false,
        reason: `Cannot transition milestone from '${currentStatus}' to '${newStatus}'`
      };
    }
  }
  
  return { canUpdate: true };
}

/**
 * Check if user can delete milestones in a deal
 */
export async function canDeleteMilestone(
  userId: string,
  milestoneId: string,
  dealId: string,
  currentStatus?: string
): Promise<{
  canDelete: boolean;
  reason?: string;
}> {
  const supabaseAdmin = getSupabaseAdmin();
  
  // 1. Get user's role in the deal
  const userRole = await getUserDealRole(userId, dealId);
  
  // 2. Check if role allows milestone deletion (more restricted than updates)
  const allowedRoles = ['admin', 'seller'];
  if (!allowedRoles.includes(userRole.toLowerCase())) {
    return {
      canDelete: false,
      reason: `Role '${userRole}' cannot delete milestones`
    };
  }
  
  // 3. Check if the deal status allows milestone deletion
  const { allowsDelete, dealStatus } = await checkDealAllowsMilestoneOperations(dealId);
  if (!allowsDelete) {
    return {
      canDelete: false,
      reason: `Deal status '${dealStatus}' does not allow milestone deletion`
    };
  }
  
  // 4. Check if milestone status allows deletion
  // Usually only not_started or possibly blocked milestones can be deleted
  if (currentStatus && !['not_started', 'blocked'].includes(currentStatus)) {
    return {
      canDelete: false,
      reason: `Cannot delete milestone with status '${currentStatus}'`
    };
  }
  
  return { canDelete: true };
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

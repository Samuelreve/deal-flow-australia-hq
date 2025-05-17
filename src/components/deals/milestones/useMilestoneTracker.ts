
import { useState, useEffect, useCallback } from 'react';
import { Milestone } from '@/types/deal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthSession } from '@/hooks/useAuthSession';

export const useMilestoneTracker = (dealId: string, initialMilestones: Milestone[] = []) => {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [loadingMilestones, setLoadingMilestones] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [updatingMilestoneId, setUpdatingMilestoneId] = useState<string | null>(null);
  const { isAuthenticated } = useAuthSession();

  // Fetch milestones from Supabase
  const fetchMilestones = useCallback(async () => {
    // If initial milestones are provided, use them instead of fetching
    if (initialMilestones.length > 0) {
      setMilestones(initialMilestones);
      setLoadingMilestones(false);
      return;
    }

    // Skip fetching if user is not authenticated
    if (!isAuthenticated) {
      setLoadingMilestones(false);
      return;
    }

    if (!dealId) {
      setLoadingMilestones(false);
      setFetchError("Deal ID is missing.");
      return;
    }

    setLoadingMilestones(true);
    setFetchError(null);
    
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('deal_id', dealId)
        .order('order_index', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      if (data) {
        // Transform the data to match our frontend Milestone type
        const transformedData: Milestone[] = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          status: item.status,
          dueDate: item.due_date ? new Date(item.due_date) : undefined,
          completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
        }));
        setMilestones(transformedData);
      }
    } catch (error: any) {
      console.error('Error fetching milestones:', error);
      setFetchError(`Failed to load milestones: ${error.message}`);
    } finally {
      setLoadingMilestones(false);
    }
  }, [dealId, initialMilestones, isAuthenticated]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  // Update milestone status
  const handleUpdateMilestoneStatus = async (milestoneId: string, newStatus: "not_started" | "in_progress" | "completed" | "blocked") => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to update milestones');
      return;
    }
    
    if (!dealId) {
      toast.error('Deal ID missing. Cannot update milestone.');
      return;
    }
    
    setUpdatingMilestoneId(milestoneId);
    
    try {
      const updates = {
        status: newStatus,
        ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : { completed_at: null })
      };
      
      const { data, error } = await supabase
        .from('milestones')
        .update(updates)
        .eq('id', milestoneId)
        .eq('deal_id', dealId) // Add deal_id filter for extra safety and RLS context
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Update local state with transformed data
      setMilestones(prevMilestones =>
        prevMilestones.map(m =>
          m.id === milestoneId ? { 
            ...m, 
            status: newStatus,
            ...(newStatus === 'completed' ? { completedAt: new Date() } : { completedAt: undefined })
          } : m
        )
      );
      
      toast.success(`Milestone updated to: ${newStatus}`);
      
    } catch (error: any) {
      console.error('Error updating milestone status:', error);
      toast.error(`Failed to update milestone: ${error.message}`);
    } finally {
      setUpdatingMilestoneId(null);
    }
  };

  return {
    milestones,
    loadingMilestones,
    fetchError,
    updatingMilestoneId,
    handleUpdateMilestoneStatus
  };
};

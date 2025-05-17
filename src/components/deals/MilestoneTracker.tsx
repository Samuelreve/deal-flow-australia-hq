
import React, { useState, useEffect } from 'react';
import { Milestone } from '@/types/deal';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface MilestoneTrackerProps {
  dealId: string;
  userRole: string;
  initialMilestones?: Milestone[];
}

const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ 
  dealId, 
  userRole,
  initialMilestones = []
}) => {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [loadingMilestones, setLoadingMilestones] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [updatingMilestoneId, setUpdatingMilestoneId] = useState<string | null>(null);

  // Fetch milestones from Supabase
  useEffect(() => {
    const fetchMilestones = async () => {
      if (initialMilestones.length > 0) {
        setMilestones(initialMilestones);
        setLoadingMilestones(false);
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
          setMilestones(data as Milestone[]);
        }
      } catch (error: any) {
        console.error('Error fetching milestones:', error);
        setFetchError(`Failed to load milestones: ${error.message}`);
      } finally {
        setLoadingMilestones(false);
      }
    };

    fetchMilestones();
  }, [dealId, initialMilestones]);

  // Update milestone status
  const handleUpdateMilestoneStatus = async (milestoneId: string, newStatus: "not_started" | "in_progress" | "completed" | "blocked") => {
    setUpdatingMilestoneId(milestoneId);
    
    try {
      const updates = {
        status: newStatus,
        ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {})
      };
      
      const { data, error } = await supabase
        .from('milestones')
        .update(updates)
        .eq('id', milestoneId)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setMilestones(prevMilestones =>
        prevMilestones.map(m =>
          m.id === milestoneId ? { ...m, ...updates } as Milestone : m
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

  // Helper function to determine status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-200 text-green-800';
      case 'in_progress': return 'bg-blue-200 text-blue-800';
      case 'blocked': return 'bg-red-200 text-red-800';
      case 'not_started': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  // Helper function to format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'blocked': return 'Blocked';
      case 'not_started': return 'Upcoming';
      default: return status;
    }
  };

  const formatDate = (dateString?: Date | string) => {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format(date, 'yyyy-MM-dd');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Deal Milestones</h3>

      {/* Loading and Error Indicators for Fetching */}
      {loadingMilestones && <p className="text-center text-blue-600">Loading milestones...</p>}
      {fetchError && <p className="text-center text-red-600">Error loading milestones: {fetchError}</p>}

      {/* Milestone List */}
      {!loadingMilestones && !fetchError && (
        milestones.length === 0 ? (
          <p className="text-gray-600">No milestones defined for this deal.</p>
        ) : (
          <ol className="relative border-s border-gray-200 dark:border-gray-700 ml-3">
            {milestones.map((milestone, index) => (
              <li key={milestone.id} className="mb-10 ms-6">
                <span className={`absolute flex items-center justify-center w-6 h-6 ${getStatusColor(milestone.status)} rounded-full -start-3 ring-8 ring-white dark:ring-gray-800`}>
                  {/* Status indicator circle */}
                </span>
                <h4 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {milestone.title}
                  <span className={`text-sm font-medium me-2 px-2.5 py-0.5 rounded ms-3 ${getStatusColor(milestone.status)}`}>
                    {formatStatus(milestone.status)}
                  </span>
                </h4>
                {(milestone.due_date || milestone.completed_at) && (
                  <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                    {milestone.status !== 'completed' 
                      ? milestone.due_date ? `Due by: ${formatDate(milestone.due_date)}` : '' 
                      : `Completed on: ${formatDate(milestone.completed_at)}`}
                  </time>
                )}
                {milestone.description && (
                  <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">{milestone.description}</p>
                )}

                {/* Action Buttons */}
                {milestone.status === 'in_progress' && ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase()) && (
                  <button
                    onClick={() => handleUpdateMilestoneStatus(milestone.id, 'completed')}
                    disabled={updatingMilestoneId === milestone.id}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 ${updatingMilestoneId === milestone.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {updatingMilestoneId === milestone.id ? 'Updating...' : 'Mark as Completed'}
                  </button>
                )}
                
                {milestone.status === 'not_started' && ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase()) && (
                  <button
                    onClick={() => handleUpdateMilestoneStatus(milestone.id, 'in_progress')}
                    disabled={updatingMilestoneId === milestone.id}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-300 mr-2"
                  >
                    {updatingMilestoneId === milestone.id ? 'Updating...' : 'Start Milestone'}
                  </button>
                )}
                
                {['in_progress', 'not_started'].includes(milestone.status) && ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase()) && (
                  <button
                    onClick={() => handleUpdateMilestoneStatus(milestone.id, 'blocked')}
                    disabled={updatingMilestoneId === milestone.id}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-red-300 ml-2"
                  >
                    {updatingMilestoneId === milestone.id ? 'Updating...' : 'Mark as Blocked'}
                  </button>
                )}
                
                {milestone.status === 'blocked' && ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase()) && (
                  <button
                    onClick={() => handleUpdateMilestoneStatus(milestone.id, 'in_progress')}
                    disabled={updatingMilestoneId === milestone.id}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-300"
                  >
                    {updatingMilestoneId === milestone.id ? 'Updating...' : 'Resume Milestone'}
                  </button>
                )}
              </li>
            ))}
          </ol>
        )
      )}
    </div>
  );
};

export default MilestoneTracker;

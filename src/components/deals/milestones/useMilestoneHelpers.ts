
import { format } from 'date-fns';

export const useMilestoneHelpers = () => {
  // Helper function to determine status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-200 text-green-800';
      case 'pending_approval': return 'bg-amber-200 text-amber-800';
      case 'in_progress': return 'bg-blue-200 text-blue-800';
      case 'blocked': return 'bg-red-200 text-red-800';
      case 'not_started': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  // Helper function to format status for display
  const formatStatus = (status: string) => {
    console.log('🏷️ Formatting status:', status, 'type:', typeof status);
    switch (status) {
      case 'completed': return 'Completed';
      case 'pending_approval': return 'Long completed';
      case 'in_progress': return 'In Progress';
      case 'blocked': return 'Blocked';
      case 'not_started': return 'Upcoming';
      default: 
        console.warn('⚠️ Unknown status received:', status);
        return status;
    }
  };

  const formatDate = (dateString?: Date | string) => {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format(date, 'yyyy-MM-dd');
  };

  return {
    getStatusColor,
    formatStatus,
    formatDate
  };
};

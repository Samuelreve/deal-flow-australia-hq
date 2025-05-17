
import React from 'react';
import { Milestone } from '@/types/deal';
import { useMilestoneHelpers } from './useMilestoneHelpers';

interface MilestoneItemProps {
  milestone: Milestone;
  userRole: string;
  updatingMilestoneId: string | null;
  onUpdateStatus: (milestoneId: string, newStatus: "not_started" | "in_progress" | "completed" | "blocked") => void;
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({ 
  milestone, 
  userRole, 
  updatingMilestoneId, 
  onUpdateStatus 
}) => {
  const { getStatusColor, formatStatus, formatDate } = useMilestoneHelpers();
  
  return (
    <li className="mb-10 ms-6">
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
          onClick={() => onUpdateStatus(milestone.id, 'completed')}
          disabled={updatingMilestoneId === milestone.id}
          className={`inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 ${updatingMilestoneId === milestone.id ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {updatingMilestoneId === milestone.id ? 'Updating...' : 'Mark as Completed'}
        </button>
      )}
      
      {milestone.status === 'not_started' && ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase()) && (
        <button
          onClick={() => onUpdateStatus(milestone.id, 'in_progress')}
          disabled={updatingMilestoneId === milestone.id}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-300 mr-2"
        >
          {updatingMilestoneId === milestone.id ? 'Updating...' : 'Start Milestone'}
        </button>
      )}
      
      {['in_progress', 'not_started'].includes(milestone.status) && ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase()) && (
        <button
          onClick={() => onUpdateStatus(milestone.id, 'blocked')}
          disabled={updatingMilestoneId === milestone.id}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-red-300 ml-2"
        >
          {updatingMilestoneId === milestone.id ? 'Updating...' : 'Mark as Blocked'}
        </button>
      )}
      
      {milestone.status === 'blocked' && ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase()) && (
        <button
          onClick={() => onUpdateStatus(milestone.id, 'in_progress')}
          disabled={updatingMilestoneId === milestone.id}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-300"
        >
          {updatingMilestoneId === milestone.id ? 'Updating...' : 'Resume Milestone'}
        </button>
      )}
    </li>
  );
};

export default MilestoneItem;


import React from 'react';
import { Milestone } from '@/types/deal';
import { useMilestoneHelpers } from './useMilestoneHelpers';
import { useAuth } from '@/contexts/AuthContext';
import MilestoneExplainButton from './MilestoneExplainButton';
import { FileText } from 'lucide-react';

interface MilestoneItemProps {
  milestone: Milestone;
  userRole: string;
  updatingMilestoneId: string | null;
  onUpdateStatus: (milestoneId: string, newStatus: "not_started" | "in_progress" | "completed" | "blocked") => void;
  isParticipant?: boolean;
  dealId: string;
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({ 
  milestone, 
  userRole, 
  updatingMilestoneId, 
  onUpdateStatus,
  isParticipant = true,
  dealId
}) => {
  const { getStatusColor, formatStatus, formatDate } = useMilestoneHelpers();
  const { user } = useAuth();

  // Determine if the current user has permission to update milestone status
  const canUpdateMilestone = isParticipant && ['admin', 'seller', 'lawyer'].includes(userRole.toLowerCase());
  
  // Check if this milestone has documents that need signing
  const hasSignableDocuments = milestone.documents && milestone.documents.length > 0 && 
    milestone.documents.some(doc => doc.status === 'draft' || doc.status === 'final');
  
  // Show sign button for in_progress milestones with signable documents
  const showSignButton = hasSignableDocuments && 
    ['in_progress'].includes(milestone.status) && 
    ['buyer', 'seller', 'lawyer'].includes(userRole.toLowerCase());

  const handleSignDocument = () => {
    // For now, we'll just log this action - can be expanded later
    console.log('Sign document clicked for milestone:', milestone.id);
    // TODO: Implement document signing flow
  };
  
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
        
        {/* Add the explain button */}
        {isParticipant && (
          <div className="ms-2">
            <MilestoneExplainButton 
              dealId={dealId}
              milestoneId={milestone.id}
              milestoneTitle={milestone.title}
              milestoneDescription={milestone.description}
              userRole={userRole}
            />
          </div>
        )}
      </h4>
      {(milestone.dueDate || milestone.completedAt) && (
        <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
          {milestone.status !== 'completed' 
            ? milestone.dueDate ? `Due by: ${formatDate(milestone.dueDate)}` : '' 
            : `Completed on: ${formatDate(milestone.completedAt)}`}
        </time>
      )}
      {milestone.description && (
        <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">{milestone.description}</p>
      )}

      {/* Action Buttons - Only show if user has permission */}
      {canUpdateMilestone && (
        <div className="flex flex-wrap gap-2">
          {/* "Mark as Completed" button - only for in_progress milestones */}
          {milestone.status === 'in_progress' && (
            <button
              onClick={() => onUpdateStatus(milestone.id, 'completed')}
              disabled={updatingMilestoneId === milestone.id}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 ${updatingMilestoneId === milestone.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {updatingMilestoneId === milestone.id ? 'Updating...' : 'Mark as Completed'}
            </button>
          )}
          
          {/* "Start Milestone" button - only for not_started milestones */}
          {milestone.status === 'not_started' && (
            <button
              onClick={() => onUpdateStatus(milestone.id, 'in_progress')}
              disabled={updatingMilestoneId === milestone.id}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-300"
            >
              {updatingMilestoneId === milestone.id ? 'Updating...' : 'Start Milestone'}
            </button>
          )}
          
          {/* "Mark as Blocked" button - for in_progress and not_started milestones */}
          {['in_progress', 'not_started'].includes(milestone.status) && (
            <button
              onClick={() => onUpdateStatus(milestone.id, 'blocked')}
              disabled={updatingMilestoneId === milestone.id}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-red-300"
            >
              {updatingMilestoneId === milestone.id ? 'Updating...' : 'Mark as Blocked'}
            </button>
          )}
          
          {/* "Resume Milestone" button - only for blocked milestones */}
          {milestone.status === 'blocked' && (
            <button
              onClick={() => onUpdateStatus(milestone.id, 'in_progress')}
              disabled={updatingMilestoneId === milestone.id}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-300"
            >
              {updatingMilestoneId === milestone.id ? 'Updating...' : 'Resume Milestone'}
            </button>
          )}
        </div>
      )}

      {/* Sign Document Button - Show separately for better visibility */}
      {showSignButton && (
        <div className="mt-3">
          <button
            onClick={handleSignDocument}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-emerald-300 animate-fade-in"
          >
            <FileText className="w-4 h-4 mr-2" />
            Sign Document
          </button>
        </div>
      )}
    </li>
  );
};

export default MilestoneItem;

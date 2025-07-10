
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
  
  // Debug logging to understand what we're working with
  console.log('Milestone data:', {
    id: milestone.id,
    title: milestone.title,
    status: milestone.status,
    documents: milestone.documents,
    userRole: userRole,
    isParticipant: isParticipant
  });
  
  // Check if this is the "Closing Preparations" milestone
  const isClosingPreparations = milestone.title.toLowerCase().includes('closing preparation');
  
  // Only show sign button for "Closing Preparations" milestone
  const showSignButton = isClosingPreparations && 
    ['buyer', 'seller', 'lawyer', 'admin'].includes(userRole.toLowerCase()) &&
    milestone.status === 'in_progress';
  
  // Check if documents are signed (for now, we'll simulate this)
  // TODO: Implement actual document signing status check
  const documentsAreSigned = false; // This would check actual document signatures
  
  // Prevent completing Closing Preparations if documents aren't signed
  const canMarkAsCompleted = milestone.status === 'in_progress' && 
    (!isClosingPreparations || documentsAreSigned);

  const handleSignDocument = () => {
    console.log('Sign document clicked for milestone:', milestone.id, milestone.title);
    // TODO: Implement actual document signing flow
    alert(`Document signing for "${milestone.title}" - Feature coming soon!\n\nOnce implemented, this will:\n- Show available documents to sign\n- Track signature status\n- Enable milestone completion once signed`);
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
          {/* "Mark as Completed" button - only for in_progress milestones with restrictions for Closing Preparations */}
          {milestone.status === 'in_progress' && (
            <button
              onClick={() => {
                if (isClosingPreparations && !documentsAreSigned) {
                  alert('Documents must be signed before completing the Closing Preparations milestone.');
                  return;
                }
                onUpdateStatus(milestone.id, 'completed');
              }}
              disabled={updatingMilestoneId === milestone.id || (isClosingPreparations && !documentsAreSigned)}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                isClosingPreparations && !documentsAreSigned 
                  ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed' 
                  : 'text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700'
              } rounded-lg focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700 ${updatingMilestoneId === milestone.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isClosingPreparations && !documentsAreSigned ? 'Documents must be signed first' : ''}
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

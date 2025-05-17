
import React from 'react';
import { Milestone } from '@/types/deal';
import MilestoneList from './MilestoneList';
import { useMilestoneTracker } from './useMilestoneTracker';

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
  const {
    milestones,
    loadingMilestones,
    fetchError,
    updatingMilestoneId,
    handleUpdateMilestoneStatus
  } = useMilestoneTracker(dealId, initialMilestones);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Deal Milestones</h3>

      {/* Loading and Error Indicators for Fetching */}
      {loadingMilestones && <p className="text-center text-blue-600">Loading milestones...</p>}
      {fetchError && <p className="text-center text-red-600">Error loading milestones: {fetchError}</p>}

      {/* Milestone List */}
      {!loadingMilestones && !fetchError && (
        <MilestoneList
          milestones={milestones}
          userRole={userRole}
          updatingMilestoneId={updatingMilestoneId}
          onUpdateStatus={handleUpdateMilestoneStatus}
        />
      )}
    </div>
  );
};

export default MilestoneTracker;


import React from 'react';
import { Milestone } from '@/types/deal';
import MilestoneItem from './MilestoneItem';

interface MilestoneListProps {
  milestones: Milestone[];
  userRole: string;
  updatingMilestoneId: string | null;
  onUpdateStatus: (milestoneId: string, newStatus: "not_started" | "in_progress" | "completed" | "blocked") => void;
}

const MilestoneList: React.FC<MilestoneListProps> = ({
  milestones,
  userRole,
  updatingMilestoneId,
  onUpdateStatus
}) => {
  if (milestones.length === 0) {
    return <p className="text-gray-600">No milestones defined for this deal.</p>;
  }

  return (
    <ol className="relative border-s border-gray-200 dark:border-gray-700 ml-3">
      {milestones.map((milestone) => (
        <MilestoneItem
          key={milestone.id}
          milestone={milestone}
          userRole={userRole}
          updatingMilestoneId={updatingMilestoneId}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </ol>
  );
};

export default MilestoneList;

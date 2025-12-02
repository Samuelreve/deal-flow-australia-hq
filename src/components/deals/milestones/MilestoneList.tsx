
import React from 'react';
import { Milestone } from '@/types/deal';
import MilestoneItem from './MilestoneItem';

interface MilestoneListProps {
  milestones: Milestone[];
  userRole: string;
  updatingMilestoneId: string | null;
  onUpdateStatus: (milestoneId: string, newStatus: "not_started" | "in_progress" | "completed" | "blocked") => void;
  isParticipant?: boolean;
  dealId: string;
  onMilestoneUpdated?: () => void;
}

const MilestoneList: React.FC<MilestoneListProps> = ({
  milestones,
  userRole,
  updatingMilestoneId,
  onUpdateStatus,
  isParticipant = false,
  dealId,
  onMilestoneUpdated
}) => {
  if (milestones.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No milestones defined for this deal.
      </p>
    );
  }

  // Sort milestones by order_index to ensure proper sequence
  const sortedMilestones = [...milestones].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  return (
    <ol className="relative border-s-2 border-border ml-3 space-y-0">
      {sortedMilestones.map((milestone, index) => {
        // Check if the previous milestone is completed (or if this is the first milestone)
        const previousMilestone = index > 0 ? sortedMilestones[index - 1] : null;
        const canStart = !previousMilestone || previousMilestone.status === 'completed';
        
        return (
          <MilestoneItem
            key={milestone.id}
            milestone={milestone}
            userRole={userRole}
            updatingMilestoneId={updatingMilestoneId}
            onUpdateStatus={onUpdateStatus}
            isParticipant={isParticipant}
            dealId={dealId}
            canStart={canStart}
            previousMilestone={previousMilestone}
            onMilestoneUpdated={onMilestoneUpdated}
          />
        );
      })}
    </ol>
  );
};

export default MilestoneList;

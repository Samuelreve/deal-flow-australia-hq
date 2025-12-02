
import React from 'react';
import { Milestone } from '@/types/deal';
import MilestoneList from './MilestoneList';
import { useMilestoneTracker } from './useMilestoneTracker';
import { useAuthSession } from '@/hooks/useAuthSession';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NextActionSuggestion from './NextActionSuggestion';
import GenerateMilestonesButton from './GenerateMilestonesButton';

interface MilestoneTrackerProps {
  dealId: string;
  userRole: string;
  initialMilestones?: Milestone[];
  isParticipant?: boolean;
}

const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ 
  dealId, 
  userRole,
  initialMilestones = [],
  isParticipant = false
}) => {
  const { isAuthenticated } = useAuthSession();
  const navigate = useNavigate();
  
  const {
    milestones,
    loadingMilestones,
    fetchError,
    updatingMilestoneId,
    handleUpdateMilestoneStatus,
    fetchMilestones
  } = useMilestoneTracker(dealId, initialMilestones);

  // Handle milestone refresh after new ones are added
  const handleMilestonesAdded = () => {
    fetchMilestones();
  };

  if (!isAuthenticated && initialMilestones.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 mb-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-foreground">Deal Milestones</h3>
        <div className="text-center py-6">
          <p className="mb-4 text-muted-foreground">You need to be logged in to view and manage milestones</p>
          <Button onClick={() => navigate('/login')} className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">Deal Milestones</h3>
          
          {/* AI-Powered Milestone Generation Button */}
          {isParticipant && (
            <GenerateMilestonesButton 
              dealId={dealId} 
              onMilestonesAdded={handleMilestonesAdded}
              userRole={userRole}
            />
          )}
        </div>

        {/* Loading and Error Indicators for Fetching */}
        {loadingMilestones && (
          <p className="text-center text-primary animate-pulse py-4">Loading milestones...</p>
        )}
        {fetchError && (
          <p className="text-center text-destructive py-4">Error loading milestones: {fetchError}</p>
        )}

        {/* Milestone List */}
        {!loadingMilestones && !fetchError && (
          <MilestoneList
            milestones={milestones}
            userRole={userRole}
            updatingMilestoneId={updatingMilestoneId}
            onUpdateStatus={handleUpdateMilestoneStatus}
            isParticipant={isParticipant}
            dealId={dealId}
            onMilestoneUpdated={fetchMilestones}
          />
        )}
      </div>

      {/* Next Action AI Coach */}
      {isParticipant && (
        <NextActionSuggestion 
          dealId={dealId}
          isParticipant={isParticipant}
          className="mb-6"
        />
      )}
    </>
  );
};

export default MilestoneTracker;

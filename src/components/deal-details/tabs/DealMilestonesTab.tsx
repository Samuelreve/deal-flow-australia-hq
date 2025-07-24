import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import MilestoneTracker from "@/components/deals/milestones/MilestoneTracker";

interface DealMilestonesTabProps {
  dealId: string;
}

const DealMilestonesTab: React.FC<DealMilestonesTabProps> = ({ dealId }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('');
  const [isParticipant, setIsParticipant] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkParticipationAndRole();
  }, [dealId, user]);

  const checkParticipationAndRole = async () => {
    if (!user || !dealId) {
      setLoading(false);
      return;
    }

    try {
      // Check if user is a participant in this deal
      const { data: participant, error: participantError } = await supabase
        .from('deal_participants')
        .select('role')
        .eq('deal_id', dealId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (participantError) {
        console.error('Error checking participation:', participantError);
      }

      // Get user profile for role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      }

      setIsParticipant(!!participant);
      setUserRole(participant?.role || profile?.role || 'buyer');
    } catch (error) {
      console.error('Error checking user participation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <MilestoneTracker
      dealId={dealId}
      userRole={userRole}
      isParticipant={isParticipant}
    />
  );
};

export default DealMilestonesTab;
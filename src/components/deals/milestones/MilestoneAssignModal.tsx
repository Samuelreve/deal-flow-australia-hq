import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, UserCheck } from 'lucide-react';

interface DealParticipant {
  id: string;
  user_id: string;
  role: string;
  status: 'accepted' | 'pending';
  profiles: {
    id: string;
    name: string;
    email: string;
  };
}

interface MilestoneAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId: string;
  dealId: string;
  currentAssignedTo?: string;
  onAssignmentUpdate: () => void;
}

const MilestoneAssignModal: React.FC<MilestoneAssignModalProps> = ({
  isOpen,
  onClose,
  milestoneId,
  dealId,
  currentAssignedTo,
  onAssignmentUpdate
}) => {
  const [participants, setParticipants] = useState<DealParticipant[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(currentAssignedTo || '');
  const [loading, setLoading] = useState(false);
  const [fetchingParticipants, setFetchingParticipants] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchDealParticipants();
    }
  }, [isOpen, dealId]);

  useEffect(() => {
    setSelectedUserId(currentAssignedTo || '');
  }, [currentAssignedTo]);

  const fetchDealParticipants = async () => {
    setFetchingParticipants(true);
    try {
      // Fetch accepted participants with proper join to profiles
      const { data: acceptedParticipants, error: participantsError } = await supabase
        .from('deal_participants')
        .select(`
          id,
          user_id,
          role,
          profiles!inner (
            id,
            name,
            email
          )
        `)
        .eq('deal_id', dealId);

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        throw participantsError;
      }

      console.log('Fetched participants:', acceptedParticipants);

      setParticipants((acceptedParticipants || []).map(p => ({
        ...p,
        status: 'accepted' as const
      })));
    } catch (error: any) {
      console.error('Error fetching participants:', error);
      toast({
        title: 'Error',
        description: 'Failed to load deal participants',
        variant: 'destructive'
      });
    } finally {
      setFetchingParticipants(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) {
      toast({
        title: 'Error',
        description: 'Please select a user to assign',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // First remove any existing assignment
      await supabase
        .from('milestone_assignments')
        .delete()
        .eq('milestone_id', milestoneId);

      // Create new assignment
      const { error } = await supabase
        .from('milestone_assignments')
        .insert({
          milestone_id: milestoneId,
          user_id: selectedUserId
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Milestone assigned successfully',
      });

      onAssignmentUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error assigning milestone:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign milestone',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('milestone_assignments')
        .delete()
        .eq('milestone_id', milestoneId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Milestone unassigned successfully',
      });

      onAssignmentUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error unassigning milestone:', error);
      toast({
        title: 'Error',
        description: 'Failed to unassign milestone',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assign Milestone
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {fetchingParticipants ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading participants...</p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium">Select Participant</label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose a participant" />
                  </SelectTrigger>
                  <SelectContent>
                    {participants.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No participants found
                      </div>
                    ) : (
                      participants.map((participant) => (
                        <SelectItem 
                          key={participant.user_id} 
                          value={participant.user_id}
                        >
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>
                              {participant.profiles.name || participant.profiles.email}
                            </span>
                            <span className="text-xs bg-secondary px-2 py-1 rounded">
                              {participant.role}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {currentAssignedTo && (
                <div className="text-sm text-muted-foreground">
                  Currently assigned to: {
                    participants.find(p => p.user_id === currentAssignedTo)?.profiles.name ||
                    participants.find(p => p.user_id === currentAssignedTo)?.profiles.email ||
                    'Unknown user'
                  }
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleAssign}
                  disabled={loading || !selectedUserId}
                  className="flex-1"
                >
                  {loading ? 'Assigning...' : 'Assign'}
                </Button>
                
                {currentAssignedTo && (
                  <Button
                    onClick={handleUnassign}
                    disabled={loading}
                    variant="outline"
                  >
                    Unassign
                  </Button>
                )}
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MilestoneAssignModal;
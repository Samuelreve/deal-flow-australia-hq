import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, X } from 'lucide-react';

interface MilestoneAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId: string;
  dealId: string;
  currentAssignedTo?: string;
  onAssignmentUpdated: () => void;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  role: string;
}

const MilestoneAssignmentModal: React.FC<MilestoneAssignmentModalProps> = ({
  isOpen,
  onClose,
  milestoneId,
  dealId,
  currentAssignedTo,
  onAssignmentUpdated
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(currentAssignedTo || '');
  const [loading, setLoading] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchParticipants();
      setSelectedUserId(currentAssignedTo || '');
    }
  }, [isOpen, dealId, currentAssignedTo]);

  const fetchParticipants = async () => {
    setLoadingParticipants(true);
    try {
      const { data, error } = await supabase
        .from('deal_participants')
        .select(`
          user_id,
          role,
          profiles:user_id (
            id,
            name,
            email
          )
        `)
        .eq('deal_id', dealId);

      if (error) throw error;

      const participantsList = data?.map(p => ({
        id: p.profiles?.id || '',
        name: p.profiles?.name || p.profiles?.email || 'Unknown',
        email: p.profiles?.email || '',
        role: p.role
      })).filter(p => p.id) || [];

      setParticipants(participantsList);
    } catch (error: any) {
      console.error('Error fetching participants:', error);
      toast({
        title: 'Error',
        description: 'Failed to load participants',
        variant: 'destructive'
      });
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) return;

    setLoading(true);
    try {
      // Update the milestone's assigned_to field
      const { error: milestoneError } = await supabase
        .from('milestones')
        .update({ assigned_to: selectedUserId })
        .eq('id', milestoneId);

      if (milestoneError) throw milestoneError;

      // Also add/update in milestone_assignments table for tracking
      const { error: assignmentError } = await supabase
        .from('milestone_assignments')
        .upsert({
          milestone_id: milestoneId,
          user_id: selectedUserId
        }, {
          onConflict: 'milestone_id,user_id'
        });

      if (assignmentError) throw assignmentError;

      toast({
        title: 'Success',
        description: 'Milestone assigned successfully'
      });

      onAssignmentUpdated();
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
      // Remove assignment from milestone
      const { error: milestoneError } = await supabase
        .from('milestones')
        .update({ assigned_to: null })
        .eq('id', milestoneId);

      if (milestoneError) throw milestoneError;

      // Remove from milestone_assignments table
      const { error: assignmentError } = await supabase
        .from('milestone_assignments')
        .delete()
        .eq('milestone_id', milestoneId);

      if (assignmentError) throw assignmentError;

      toast({
        title: 'Success',
        description: 'Milestone unassigned successfully'
      });

      onAssignmentUpdated();
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assign Milestone
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Assign to participant:
            </label>
            
            {loadingParticipants ? (
              <div className="text-sm text-muted-foreground">Loading participants...</div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a participant" />
                </SelectTrigger>
                <SelectContent>
                  {participants.map((participant) => (
                    <SelectItem key={participant.id} value={participant.id}>
                      <div className="flex flex-col">
                        <span>{participant.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {participant.email} • {participant.role}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              <Button
                onClick={handleAssign}
                disabled={!selectedUserId || loading || loadingParticipants}
              >
                {loading ? 'Assigning...' : 'Assign'}
              </Button>
              
              {currentAssignedTo && (
                <Button
                  variant="outline"
                  onClick={handleUnassign}
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Unassign
                </Button>
              )}
            </div>
            
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MilestoneAssignmentModal;
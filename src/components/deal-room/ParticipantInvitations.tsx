
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, Calendar, User, Loader2 } from 'lucide-react';

interface Invitation {
  id: string;
  invitee_email: string;
  invitee_role: string;
  status: string;
  created_at: string;
  invited_by: {
    name: string;
  };
}

interface ParticipantInvitationsProps {
  dealId: string;
  userRole: string | null;
  onInvitationSent: () => void;
}

const ParticipantInvitations: React.FC<ParticipantInvitationsProps> = ({
  dealId,
  userRole,
  onInvitationSent
}) => {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'buyer'
  });

  const canInvite = userRole === 'admin' || userRole === 'seller';

  useEffect(() => {
    if (canInvite) {
      fetchInvitations();
    } else {
      setLoading(false);
    }
  }, [dealId, canInvite]);

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase.rpc('get_deal_invitations', {
        p_deal_id: dealId
      });

      if (error) {
        console.error('Error fetching invitations:', error);
        toast({
          title: "Error",
          description: "Failed to load invitations",
          variant: "destructive"
        });
      } else if (data?.success) {
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteForm.email || !inviteForm.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setInviting(true);

    try {
      const { data, error } = await supabase.rpc('create_deal_invitation', {
        p_deal_id: dealId,
        p_invitee_email: inviteForm.email,
        p_invitee_role: inviteForm.role
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Invitation Sent",
          description: `Invitation sent to ${inviteForm.email}`,
        });
        
        setInviteForm({ email: '', role: 'buyer' });
        setShowInviteForm(false);
        fetchInvitations();
        onInvitationSent();
      } else {
        throw new Error(data?.message || 'Failed to send invitation');
      }
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive"
      });
    } finally {
      setInviting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!canInvite) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600">Only deal administrators and sellers can manage invitations.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading invitations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Invite Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Invite Participants
            </CardTitle>
            
            {!showInviteForm && (
              <Button onClick={() => setShowInviteForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Invitation
              </Button>
            )}
          </div>
        </CardHeader>
        
        {showInviteForm && (
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteForm.role} onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="lawyer">Lawyer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button type="submit" disabled={inviting}>
                  {inviting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteForm({ email: '', role: 'buyer' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations ({invitations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Invitations</h3>
              <p className="text-gray-600">No invitations have been sent for this deal yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">{invitation.invitee_email}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <Badge variant="outline" className="capitalize">
                          {invitation.invitee_role}
                        </Badge>
                        <Badge className={getStatusColor(invitation.status)}>
                          {invitation.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Invited by {invitation.invited_by?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(invitation.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParticipantInvitations;

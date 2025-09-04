
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Users, Building } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

interface InvitationDetails {
  dealId: string;
  inviteeEmail: string;
  inviteeRole: string;
  dealTitle: string;
  inviterName: string;
  status: string;
}

const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userExists, setUserExists] = useState<boolean | null>(null);

  const token = searchParams.get('token');

  const checkUserExists = async (email: string) => {
    try {
      console.log('Checking if user exists for email:', email);
      
      // First check profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error checking profiles:', profileError);
      }
      
      console.log('Profile check result:', { profile, profileError });
      
      if (profile) {
        console.log('User found in profiles table');
        setUserExists(true);
        return;
      }
      
      // If not found in profiles, try checking through a function that can access auth.users
      try {
        const { data: checkResult, error: functionError } = await supabase.functions.invoke('check-user-exists', {
          body: { email }
        });
        
        if (!functionError && checkResult) {
          console.log('Function check result:', checkResult);
          setUserExists(checkResult.exists);
          return;
        }
      } catch (functionError) {
        console.log('Function check not available:', functionError);
      }
      
      // Default to false if no user found
      console.log('User does not exist');
      setUserExists(false);
      
    } catch (error) {
      console.error('Error in checkUserExists:', error);
      // Default to null so both buttons are shown
      setUserExists(null);
    }
  };

  useEffect(() => {
    if (token) {
      verifyInvitation();
    } else {
      setError('Invalid invitation link - missing token');
      setLoading(false);
    }
  }, [token]);

  const verifyInvitation = async () => {
    if (!token) return;

    try {
      console.log('Attempting to verify invitation with token:', token);
      
      // First try the edge function
      try {
        const { data, error } = await supabase.functions.invoke('verify-invitation-token', {
          body: { token }
        });

        console.log('Function response:', { data, error });

        if (!error && data && data.status === 'valid') {
          setInvitation(data);
          
          // Check if user exists for this email
          await checkUserExists(data.inviteeEmail);
          return;
        }
      } catch (functionError) {
        console.log('Edge function not available, falling back to direct query:', functionError);
      }

      // Fallback: Direct database query
      console.log('Using fallback method - direct database query');
      
      const { data: invitation, error: invitationError } = await supabase
        .from('deal_invitations')
        .select(`
          id,
          deal_id,
          invitee_email,
          invitee_role,
          status,
          created_at,
          invited_by_user_id
        `)
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .maybeSingle();

      if (invitationError) {
        console.error('Database error:', invitationError);
        throw new Error('Failed to verify invitation');
      }

      if (!invitation) {
        setError('Invitation not found or has expired');
        return;
      }

      // Get deal details
      const { data: deal } = await supabase
        .from('deals')
        .select('id, title')
        .eq('id', invitation.deal_id)
        .maybeSingle();

      // Get inviter details
      const { data: inviter } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', invitation.invited_by_user_id)
        .maybeSingle();

      // Set invitation details
      const invitationDetails = {
        dealId: invitation.deal_id,
        inviteeEmail: invitation.invitee_email,
        inviteeRole: invitation.invitee_role,
        dealTitle: deal?.title || 'Unknown Deal',
        inviterName: inviter?.name || 'Unknown User',
        status: 'valid'
      };

      setInvitation(invitationDetails);
      
      // Check if user exists for this email
      await checkUserExists(invitation.invitee_email);

    } catch (error: any) {
      console.error('Error verifying invitation:', error);
      setError(error.message || 'Failed to verify invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!invitation || !user || !token) return;

    setAccepting(true);

    try {
      console.log('Accepting invitation with:', { token, userId: user.id });
      
      const { data, error } = await supabase.rpc('accept_invitation', {
        p_token: token,
        p_user_id: user.id
      });

      console.log('Accept invitation response:', { data, error });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw error;
      }

      // The function returns an array, check if we have valid data
      if (data && Array.isArray(data) && data.length > 0 && data[0].success) {
        const result = data[0];
        toast({
          title: "Invitation Accepted",
          description: `You've successfully joined the deal: ${invitation.dealTitle}`,
        });

        console.log('Redirecting to deal:', result.deal_id);
        // Redirect to the deal details
        navigate(`/deals/${result.deal_id}`);
      } else {
        console.error('Invalid response data:', data);
        throw new Error('Failed to accept invitation - invalid response');
      }
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation",
        variant: "destructive"
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleDeclineInvitation = async () => {
    if (!token) return;

    setAccepting(true);

    try {
      // First try the edge function
      try {
        const { data, error } = await supabase.functions.invoke('decline-invitation', {
          body: { token }
        });

        if (!error && data && data.success) {
          toast({
            title: "Invitation Declined",
            description: "You have declined the invitation.",
          });
          navigate('/');
          return;
        }
      } catch (functionError) {
        console.log('Edge function not available, falling back to direct update:', functionError);
      }

      // Fallback: Direct database update
      console.log('Using fallback method for declining invitation');
      
      const { data, error } = await supabase
        .from('deal_invitations')
        .update({ 
          status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error declining invitation:', error);
        throw new Error('Failed to decline invitation');
      }

      if (!data) {
        throw new Error('Invitation not found or already processed');
      }

      toast({
        title: "Invitation Declined",
        description: "You have declined the invitation.",
      });
      navigate('/');

    } catch (error: any) {
      console.error('Error declining invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to decline invitation",
        variant: "destructive"
      });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12 max-w-md">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Verifying invitation...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <XCircle className="h-5 w-5 mr-2" />
                Invalid Invitation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                Go to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Deal Invitation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Building className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">You're Invited!</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {invitation?.inviterName} has invited you to join the deal "{invitation?.dealTitle}"
                  </p>
                </div>
                
                <p className="text-gray-600">
                  Please log in or create an account to accept this invitation.
                </p>
                
                <div className="space-y-2">
                  {userExists === true ? (
                    // User exists - show login as primary button
                    <>
                      <Button 
                        onClick={() => navigate(`/login?inviteToken=${token}`)}
                        className="w-full"
                      >
                        Log In
                      </Button>
                      <Button 
                        onClick={() => navigate(`/signup?inviteToken=${token}`)}
                        variant="outline"
                        className="w-full"
                      >
                        Create New Account
                      </Button>
                    </>
                  ) : userExists === false ? (
                    // User doesn't exist - show create account as primary button  
                    <>
                      <Button 
                        onClick={() => navigate(`/signup?inviteToken=${token}`)}
                        className="w-full"
                      >
                        Create Account
                      </Button>
                      <Button 
                        onClick={() => navigate(`/login?inviteToken=${token}`)}
                        variant="outline"
                        className="w-full"
                      >
                        Log In Instead
                      </Button>
                    </>
                  ) : (
                    // Unknown status - show both buttons equally
                    <>
                      <Button 
                        onClick={() => navigate(`/login?inviteToken=${token}`)}
                        className="w-full"
                      >
                        Log In
                      </Button>
                      <Button 
                        onClick={() => navigate(`/signup?inviteToken=${token}`)}
                        variant="outline"
                        className="w-full"
                      >
                        Create Account
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Deal Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="p-4 bg-blue-50 rounded-lg mb-4">
                  <Building className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 mb-2">You're Invited!</h3>
                  <p className="text-sm text-gray-600">
                    <strong>{invitation?.inviterName}</strong> has invited you to join:
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-lg text-gray-900 mb-2">
                    {invitation?.dealTitle}
                  </h4>
                  
                  <div className="flex items-center justify-center space-x-4">
                    <Badge variant="outline" className="capitalize">
                      Role: {invitation?.inviteeRole}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-6">
                  By accepting this invitation, you'll gain access to the deal room where you can 
                  collaborate with other participants, review documents, and track progress.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleAcceptInvitation}
                  disabled={accepting}
                  className="w-full"
                >
                  {accepting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Invitation
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleDeclineInvitation}
                  variant="outline" 
                  className="w-full"
                  disabled={accepting}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AcceptInvitePage;

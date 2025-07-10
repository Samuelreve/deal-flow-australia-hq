
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
      const { data, error } = await supabase.functions.invoke('verify-invitation-token', {
        body: { token }
      });

      if (error) {
        throw error;
      }

      if (data.status === 'valid') {
        setInvitation(data);
        
        // Check if user exists for this email
        try {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', data.inviteeEmail)
            .maybeSingle();
          
          setUserExists(!!profiles);
        } catch (error) {
          console.error('Error checking if user exists:', error);
          setUserExists(false);
        }
      } else {
        setError(data.error || 'Invalid invitation');
      }
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
      const { data, error } = await supabase.functions.invoke('decline-invitation', {
        body: { token }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Invitation Declined",
          description: "You have declined the invitation.",
        });
        navigate('/');
      } else {
        throw new Error(data.error || 'Failed to decline invitation');
      }
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
                  {userExists !== false && (
                    <Button 
                      onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
                      className="w-full"
                    >
                      Log In
                    </Button>
                  )}
                  {userExists !== true && (
                    <Button 
                      onClick={() => navigate(`/signup?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
                      variant={userExists === false ? "default" : "outline"} 
                      className="w-full"
                    >
                      Create Account
                    </Button>
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

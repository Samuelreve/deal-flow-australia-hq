
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Define the expected structure of the successful backend acceptance response
interface AcceptanceSuccessResponse {
  message: string;
  dealId: string;
}

export const useInvitationAcceptance = (inviteToken: string | null) => {
  const { user, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // State to track the invitation acceptance process
  const [acceptanceStatus, setAcceptanceStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [acceptedDealId, setAcceptedDealId] = useState<string | null>(null);
  
  // Backend API endpoint for accepting invitation
  const acceptInvitationUrl = '/api/invitations/accept'; // Example URL
  
  // Function to handle invitation acceptance
  const handleAcceptInvitation = async (token: string, userId: string) => {
    setStatusMessage(null);
    
    try {
      // Make the POST request to your backend acceptance endpoint
      const response = await fetch(acceptInvitationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ token: token, userId: userId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          throw new Error(errorData.message || 'Invalid invitation data.');
        }
        if (response.status === 404) {
          throw new Error(errorData.message || 'Invitation not found or expired.');
        }
        if (response.status === 409) {
          throw new Error(errorData.message || 'Invitation already accepted or you are already a participant.');
        }
        if (response.status === 403) {
          throw new Error(errorData.message || 'Permission denied to accept this invitation.');
        }
        throw new Error(errorData.message || `Invitation acceptance failed with status: ${response.status}`);
      }
      
      const result: AcceptanceSuccessResponse = await response.json();
      
      console.log('Invitation accepted successfully:', result);
      setStatusMessage(result.message || 'Invitation accepted successfully!');
      setAcceptedDealId(result.dealId);
      setAcceptanceStatus('success');
      toast.success(result.message || 'Invitation accepted!');
      
    } catch (error: any) {
      console.error('Invitation acceptance error:', error);
      setStatusMessage(`Failed to accept invitation: ${error.message}`);
      setAcceptanceStatus('error');
      toast.error(`Failed to accept invitation: ${error.message}`);
    }
  };
  
  // Effect to handle logic based on auth state and token
  useEffect(() => {
    if (authLoading) {
      setAcceptanceStatus('loading');
      setStatusMessage('Loading authentication state...');
      return;
    }
    
    if (!inviteToken) {
      setAcceptanceStatus('error');
      setStatusMessage('Invalid invitation link: Token is missing.');
      toast.error('Invalid invitation link.');
      return;
    }
    
    if (user) {
      setAcceptanceStatus('loading');
      setStatusMessage('Accepting invitation...');
      handleAcceptInvitation(inviteToken, user.id);
    } else {
      setAcceptanceStatus('idle');
      setStatusMessage('Please log in or sign up to accept this invitation.');
    }
    
  }, [authLoading, user, inviteToken]);
  
  // Effect to redirect on success
  useEffect(() => {
    if (acceptanceStatus === 'success' && acceptedDealId) {
      const redirectTimer = setTimeout(() => {
        navigate(`/deals/${acceptedDealId}`);
      }, 2000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [acceptanceStatus, acceptedDealId, navigate]);
  
  return {
    acceptanceStatus,
    statusMessage,
    acceptedDealId,
  };
};

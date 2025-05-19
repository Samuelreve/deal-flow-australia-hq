
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { invitationService } from '@/services/invitationService';

export const useInvitationAcceptance = (inviteToken: string | null) => {
  const { user, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // State to track the invitation acceptance process
  const [acceptanceStatus, setAcceptanceStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [acceptedDealId, setAcceptedDealId] = useState<string | null>(null);
  
  // Function to handle invitation acceptance
  const handleAcceptInvitation = async (token: string, userId: string) => {
    setAcceptanceStatus('loading');
    setStatusMessage('Accepting invitation...');
    
    if (!session?.access_token) {
      setAcceptanceStatus('error');
      setStatusMessage('Authentication token missing');
      toast.error('Authentication token missing');
      return;
    }
    
    const result = await invitationService.acceptInvitation(
      token,
      userId,
      session.access_token
    );
    
    if (result.success && result.data) {
      console.log('Invitation accepted successfully:', result.data);
      setStatusMessage(result.data.message || 'Invitation accepted successfully!');
      setAcceptedDealId(result.data.dealId);
      setAcceptanceStatus('success');
      toast.success(result.data.message || 'Invitation accepted!');
    } else {
      console.error('Invitation acceptance error:', result.error);
      setStatusMessage(`Failed to accept invitation: ${result.error}`);
      setAcceptanceStatus('error');
      toast.error(`Failed to accept invitation: ${result.error}`);
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

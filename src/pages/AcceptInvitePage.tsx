
import React from 'react';
import { useSearchParams } from 'react-router-dom'; 
import { useInvitationAcceptance } from '@/hooks/invitation/useInvitationAcceptance';
import InvitationLoading from '@/components/invitation/InvitationLoading';
import InvitationStatus from '@/components/invitation/InvitationStatus';
import InvitationActions from '@/components/invitation/InvitationActions';

const AcceptInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams(); 
  const inviteToken = searchParams.get('token');
  
  // Use our custom hook to handle the invitation acceptance logic
  const { acceptanceStatus, statusMessage, acceptedDealId } = useInvitationAcceptance(inviteToken);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Accept Invitation</h2>

        {/* Conditional rendering based on acceptance status */}
        {acceptanceStatus === 'loading' && (
          <InvitationLoading message={statusMessage} />
        )}

        {acceptanceStatus === 'success' && (
          <InvitationStatus message={statusMessage} type="success">
            {acceptedDealId && <p className="text-sm mt-2">Redirecting to deal...</p>}
          </InvitationStatus>
        )}

        {acceptanceStatus === 'error' && (
          <InvitationStatus message={statusMessage} type="error">
            {!inviteToken && <p className="text-sm mt-2"><a href="/" className="underline">Go to Homepage</a></p>}
          </InvitationStatus>
        )}

        {acceptanceStatus === 'idle' && (
          <InvitationActions 
            message={statusMessage}
            inviteToken={inviteToken}
          />
        )}
      </div>
    </div>
  );
};

export default AcceptInvitePage;

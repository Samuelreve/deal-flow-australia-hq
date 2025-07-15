
interface InvitationActionsProps {
  message: string | null;
  inviteToken: string | null;
}

const InvitationActions = ({ message, inviteToken }: InvitationActionsProps) => {
  return (
    <div>
      <p className="text-gray-700 mb-4">{message}</p>
      <div className="flex justify-center space-x-4">
        {/* Link to Accept Invitation Page */}
        <a
          href={`/accept-invite?token=${inviteToken}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Accept Invitation
        </a>
      </div>
    </div>
  );
};

export default InvitationActions;

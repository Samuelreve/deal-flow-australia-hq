
interface InvitationActionsProps {
  message: string | null;
  inviteToken: string | null;
}

const InvitationActions = ({ message, inviteToken }: InvitationActionsProps) => {
  return (
    <div>
      <p className="text-gray-700 mb-4">{message}</p>
      <div className="flex justify-center space-x-4">
        {/* Link to Login Page (pass token) */}
        <a
          href={`/login?inviteToken=${inviteToken}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Log In
        </a>
        {/* Link to Sign Up Page (pass token) */}
        <a
          href={`/signup?inviteToken=${inviteToken}`}
          className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
        >
          Sign Up
        </a>
      </div>
    </div>
  );
};

export default InvitationActions;

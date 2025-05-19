
import { Loader2 } from "lucide-react";

interface InvitationLoadingProps {
  message: string | null;
}

const InvitationLoading = ({ message }: InvitationLoadingProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-blue-600 mb-4">
      <Loader2 className="h-8 w-8 animate-spin mb-2" />
      <p>{message}</p>
    </div>
  );
};

export default InvitationLoading;

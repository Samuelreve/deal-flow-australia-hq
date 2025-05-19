
import { ReactNode } from "react";

interface InvitationStatusProps {
  message: string | null;
  type: "success" | "error";
  children?: ReactNode;
}

const InvitationStatus = ({ message, type, children }: InvitationStatusProps) => {
  const colorClass = type === "success" ? "text-green-600" : "text-red-600";
  
  return (
    <div className={`${colorClass} mb-4`}>
      <p>{message}</p>
      {children}
    </div>
  );
};

export default InvitationStatus;

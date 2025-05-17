
import React from "react";
import { DealInvitation } from "@/types/invitation";

interface PendingInvitationsProps {
  invitations: DealInvitation[];
  isLoading: boolean;
}

const PendingInvitations: React.FC<PendingInvitationsProps> = ({ invitations, isLoading }) => {
  if (isLoading || invitations.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="text-sm font-medium mb-2">Pending Invitations</h4>
      {invitations.map((invitation) => (
        <div key={invitation.id} className="flex items-center justify-between py-2 text-sm">
          <div>
            <p className="font-medium">{invitation.email}</p>
            <p className="text-xs text-muted-foreground">
              Invited as {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)} on{" "}
              {new Intl.DateTimeFormat("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric"
              }).format(new Date(invitation.created_at))}
            </p>
          </div>
          <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
            Pending
          </span>
        </div>
      ))}
    </div>
  );
};

export default PendingInvitations;

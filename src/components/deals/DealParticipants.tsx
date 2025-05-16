
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Deal } from "@/types/deal";

interface DealParticipantsProps {
  deal: Deal;
}

const DealParticipants = ({ deal }: DealParticipantsProps) => {
  return (
    <div className="space-y-4">
      {deal.participants.map(participant => (
        <div key={participant.id} className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://ui-avatars.com/api/?name=User+${participant.id}&background=0D8ABC&color=fff`} alt={`User ${participant.id}`} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              {participant.role === "seller" ? "Seller" : 
               participant.role === "buyer" ? "Buyer" : 
               participant.role === "lawyer" ? "Lawyer" : "Admin"}
            </p>
            <p className="text-xs text-muted-foreground">
              Joined {new Intl.DateTimeFormat("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric"
              }).format(participant.joined)}
            </p>
          </div>
        </div>
      ))}
      {deal.status === "draft" && (
        <Button variant="outline" className="w-full text-sm">
          <Users className="h-4 w-4 mr-2" />
          Invite Participant
        </Button>
      )}
    </div>
  );
};

export default DealParticipants;

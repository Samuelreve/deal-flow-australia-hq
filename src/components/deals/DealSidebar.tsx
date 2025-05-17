
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DealHealth from "@/components/deals/DealHealth";
import DealParticipants from "@/components/deals/DealParticipants";
import { Deal } from "@/types/deal";

interface DealSidebarProps {
  deal: Deal;
  onParticipantsLoaded: (participants: any[]) => void;
  currentUserDealRole: 'seller' | 'buyer' | 'lawyer' | 'admin' | null;
  isParticipant: boolean;
}

const DealSidebar: React.FC<DealSidebarProps> = ({ 
  deal, 
  onParticipantsLoaded,
  currentUserDealRole,
  isParticipant
}) => {
  return (
    <div>
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Deal Health</CardTitle>
        </CardHeader>
        <CardContent>
          <DealHealth healthScore={deal.healthScore} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <DealParticipants 
            deal={deal} 
            onParticipantsLoaded={onParticipantsLoaded}
            currentUserDealRole={currentUserDealRole} 
            dealStatus={deal.status}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DealSidebar;

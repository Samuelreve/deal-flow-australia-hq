
// src/components/deals/DealHeader.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Deal } from "@/types/deal";
import StatusBadge from "@/components/deals/status/StatusBadge";
import StatusChangeControl from "@/components/deals/status/StatusChangeControl";
import DealHealth from "@/components/deals/DealHealth";
import DealSummaryButton from "@/components/deals/DealSummaryButton";

interface DealHeaderProps {
  deal: Deal;
  userRole?: string;
  isParticipant: boolean;
  onStatusUpdated?: () => void;
}

const DealHeader: React.FC<DealHeaderProps> = ({ 
  deal, 
  userRole = 'user', 
  isParticipant = false,
  onStatusUpdated
}) => {
  const navigate = useNavigate();
  
  const goBackToDealsList = () => {
    navigate("/deals");
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <Button 
          variant="ghost" 
          className="px-2 py-1 h-auto" 
          onClick={goBackToDealsList}
        >
          <ArrowLeftCircle className="h-4 w-4 mr-1" /> Back to Deals
        </Button>
        
        <div className="flex items-center gap-2">
          {isParticipant && (
            <DealSummaryButton 
              dealId={deal.id}
              userRole={userRole}
            />
          )}
          
          <StatusChangeControl 
            dealId={deal.id}
            currentStatus={deal.status}
            onStatusUpdated={onStatusUpdated}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{deal.title}</h1>
          
          <div className="flex flex-wrap gap-2 mt-2 items-center">
            <StatusBadge status={deal.status} />
            
            {deal.businessName && (
              <Badge variant="outline" className="text-muted-foreground">
                {deal.businessName}
              </Badge>
            )}
            
            <DealHealth healthScore={deal.healthScore} />
          </div>
          
          {deal.description && (
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              {deal.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealHeader;

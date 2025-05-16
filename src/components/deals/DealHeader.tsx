
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText, MessageSquare } from "lucide-react";
import { Deal } from "@/types/deal";
import { cn } from "@/lib/utils";

interface DealHeaderProps {
  deal: Deal;
}

const DealHeader = ({ deal }: DealHeaderProps) => {
  const navigate = useNavigate();

  const getStatusClass = (status: string) => {
    return `deal-status-${status}`;
  };

  return (
    <div className="mb-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ChevronLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      
      <div className="flex flex-wrap gap-4 items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold">{deal.title}</h1>
            <Badge className={cn("deal-status-badge", getStatusClass(deal.status))}>
              {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground">{deal.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" /> Add Document
          </Button>
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" /> Message
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DealHeader;


import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText, MessageSquare, Download, Upload } from "lucide-react";
import { Deal } from "@/types/deal";
import { StatusBadge } from "./status/StatusBadge";
import { StatusChangeControl } from "./status/StatusChangeControl";
import { useAllowedDealStatuses } from "@/hooks/useAllowedDealStatuses";

interface DealHeaderProps {
  deal: Deal;
  userRole?: string;
  isParticipant?: boolean;
  onStatusUpdated?: () => void;
}

const DealHeader = ({ 
  deal, 
  userRole = 'viewer', 
  isParticipant = false,
  onStatusUpdated
}: DealHeaderProps) => {
  const navigate = useNavigate();
  const { allowedStatuses, isLoading } = useAllowedDealStatuses(deal.id);

  const handleAddDocument = () => {
    // Scroll to the documents tab and activate it
    const tabsElement = document.querySelector('[data-radix-tabs-id]');
    const documentsTab = document.querySelector('[data-value="documents"]') as HTMLButtonElement;
    
    if (documentsTab) {
      documentsTab.click();
      setTimeout(() => {
        const uploadSection = document.querySelector('.border-t.pt-4');
        uploadSection?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
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
            <div className="flex items-center gap-2">
              <StatusBadge status={deal.status} />
              
              {/* Status Change Control - Only show for participants and when allowed statuses are loaded */}
              {isParticipant && !isLoading && (
                <StatusChangeControl 
                  dealId={deal.id}
                  currentStatus={deal.status}
                  allowedStatuses={allowedStatuses}
                  onStatusUpdated={onStatusUpdated}
                />
              )}
            </div>
          </div>
          <p className="text-muted-foreground">{deal.description}</p>
        </div>
        <div className="flex gap-2">
          {isParticipant && (
            <Button variant="outline" onClick={handleAddDocument}>
              <Upload className="h-4 w-4 mr-2" /> Add Document
            </Button>
          )}
          {isParticipant && (
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" /> Message
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealHeader;

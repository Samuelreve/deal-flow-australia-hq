
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText, MessageSquare, Download, Upload } from "lucide-react";
import { Deal } from "@/types/deal";
import { cn } from "@/lib/utils";

interface DealHeaderProps {
  deal: Deal;
  userRole?: string;
  isParticipant?: boolean;
}

const DealHeader = ({ deal, userRole = 'viewer', isParticipant = false }: DealHeaderProps) => {
  const navigate = useNavigate();

  const getStatusClass = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-200 text-gray-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
            <Badge className={cn(getStatusClass(deal.status))}>
              {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
            </Badge>
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

import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText, MessageSquare, Download, Upload } from "lucide-react";
import { Deal, DealStatus } from "@/types/deal";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface DealHeaderProps {
  deal: Deal;
  userRole?: string;
  isParticipant?: boolean;
}

const DealHeader = ({ deal, userRole = 'viewer', isParticipant = false }: DealHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DealStatus>(deal.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Define possible deal statuses
  const possibleDealStatuses: DealStatus[] = ['draft', 'active', 'pending', 'completed', 'cancelled'];

  // RBAC: Determine if user can change deal status
  const canChangeDealStatus = userRole === 'admin' || userRole === 'seller';

  // RBAC: Determine allowed next statuses based on current status and role
  const getAllowedNextStatuses = (currentStatus: DealStatus, role: string): DealStatus[] => {
    if (role === 'admin') {
      // Admin can change to any status
      return possibleDealStatuses.filter(s => s !== currentStatus);
    }
    if (role === 'seller') {
      switch (currentStatus) {
        case 'draft': return ['active', 'cancelled'];
        case 'active': return ['pending', 'completed', 'cancelled'];
        case 'pending': return ['active', 'completed', 'cancelled'];
        // Cannot change status if already completed or cancelled (for Seller)
        case 'completed': return [];
        case 'cancelled': return [];
        default: return [];
      }
    }
    // Other roles cannot change status
    return [];
  };

  const allowedNextStatuses = getAllowedNextStatuses(deal.status, userRole);
  const showStatusChangeControl = canChangeDealStatus && allowedNextStatuses.length > 0 && isParticipant;

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

  // Handle status selection change
  const handleStatusSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value as DealStatus);
  };

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === deal.status) {
      setIsEditingStatus(false);
      return;
    }

    // RBAC check before attempting update
    if (!canChangeDealStatus || !allowedNextStatuses.includes(selectedStatus)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to change the status to this value.",
        variant: "destructive"
      });
      setIsEditingStatus(false);
      return;
    }

    setIsUpdatingStatus(true);

    try {
      // Here you would make the API call to update the deal status
      // For now we'll just simulate success
      // In a real implementation, you would call an API endpoint or use Supabase
      
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Status updated",
        description: `Deal status changed to ${selectedStatus}`
      });
      
      setIsEditingStatus(false);
      // In a real implementation, you might want to refresh the deal data here
      
    } catch (error: any) {
      console.error('Failed to update deal status:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update the deal status",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStatus(false);
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
              <Badge className={cn(getStatusClass(deal.status))}>
                {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
              </Badge>
              
              {/* Status Change Control */}
              {showStatusChangeControl && (
                <div className="relative ml-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditingStatus(!isEditingStatus)}
                    disabled={isUpdatingStatus}
                    className="h-7 text-xs"
                  >
                    {isUpdatingStatus ? "Updating..." : "Change Status"}
                  </Button>
                  
                  {isEditingStatus && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10 p-2">
                      <label htmlFor="new-status" className="block text-xs font-medium text-gray-700 mb-1">
                        Select New Status:
                      </label>
                      <select
                        id="new-status"
                        value={selectedStatus}
                        onChange={handleStatusSelect}
                        className="block w-full text-sm border border-gray-300 rounded-md p-1.5"
                        disabled={isUpdatingStatus}
                      >
                        {allowedNextStatuses.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                      <div className="mt-2 flex justify-end">
                        <Button
                          size="sm"
                          onClick={handleUpdateStatus}
                          disabled={selectedStatus === deal.status || isUpdatingStatus}
                          className="h-7 text-xs w-full"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
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

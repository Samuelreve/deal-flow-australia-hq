
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DealStatus } from "@/types/deal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAllowedDealStatuses } from "@/hooks/useAllowedDealStatuses";

interface StatusChangeControlProps {
  dealId: string;
  currentStatus: DealStatus;
  onStatusUpdated?: () => void;
}

export const StatusChangeControl = ({ 
  dealId, 
  currentStatus,
  onStatusUpdated 
}: StatusChangeControlProps) => {
  const { toast } = useToast();
  const { allowedStatuses, isLoading } = useAllowedDealStatuses(dealId, currentStatus);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DealStatus>(currentStatus);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Handle status selection change
  const handleStatusSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value as DealStatus);
  };

  // Handle status update using our Supabase RPC function
  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === currentStatus) {
      setIsEditingStatus(false);
      return;
    }

    setIsUpdatingStatus(true);

    try {
      // Call our update_deal_status RPC function
      const { data, error } = await supabase.rpc('update_deal_status', {
        p_deal_id: dealId,
        p_new_status: selectedStatus
      });

      if (error) {
        console.error('Failed to update deal status:', error);
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive"
        });
        setIsUpdatingStatus(false);
        return;
      }
      
      toast({
        title: "Status updated",
        description: `Deal status changed to ${selectedStatus}`
      });
      
      setIsEditingStatus(false);
      
      // Call the callback to refresh deal data if provided
      if (onStatusUpdated) {
        onStatusUpdated();
      }
      
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

  // Don't render anything if there are no allowed statuses
  if (allowedStatuses.length === 0) {
    return null;
  }

  return (
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
            {allowedStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <div className="mt-2 flex justify-end">
            <Button
              size="sm"
              onClick={handleUpdateStatus}
              disabled={selectedStatus === currentStatus || isUpdatingStatus}
              className="h-7 text-xs w-full"
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

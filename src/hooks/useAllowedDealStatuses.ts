
import { useState, useEffect } from "react";
import { DealStatus } from "@/types/deal";
import { supabase } from "@/integrations/supabase/client";

interface AllowedStatusesResponse {
  current_status?: string;
  allowed_statuses?: DealStatus[];
  participant_role?: string;
}

export const useAllowedDealStatuses = (dealId: string) => {
  const [allowedStatuses, setAllowedStatuses] = useState<DealStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllowedStatuses = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase.rpc('get_allowed_deal_statuses', {
          p_deal_id: dealId
        });

        if (error) {
          console.error('Error fetching allowed statuses:', error);
          setError(error.message);
          return;
        }

        const response = data as AllowedStatusesResponse;
        
        if (response && Array.isArray(response.allowed_statuses)) {
          setAllowedStatuses(response.allowed_statuses as DealStatus[]);
        } else {
          console.warn('Unexpected response format:', response);
          setAllowedStatuses([]);
        }
      } catch (error: any) {
        console.error('Failed to fetch allowed statuses:', error);
        setError(error.message || 'Failed to fetch allowed statuses');
      } finally {
        setIsLoading(false);
      }
    };

    if (dealId) {
      fetchAllowedStatuses();
    }
  }, [dealId]);

  return { allowedStatuses, isLoading, error };
};

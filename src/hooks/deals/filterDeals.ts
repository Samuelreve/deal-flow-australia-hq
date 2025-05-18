
import { DealSummary } from "@/types/deal";

/**
 * Filters deals based on status and search term
 */
export const filterDeals = (
  deals: DealSummary[], 
  statusFilter: string, 
  searchTerm: string
): DealSummary[] => {
  let result = [...deals];

  // Apply status filter
  if (statusFilter !== "all") {
    result = result.filter(deal => deal.status === statusFilter);
  }
  
  // Apply search filter
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    result = result.filter(deal => 
      deal.title.toLowerCase().includes(searchLower) ||
      (deal.businessName && deal.businessName.toLowerCase().includes(searchLower)) ||
      (deal.sellerName && deal.sellerName.toLowerCase().includes(searchLower)) ||
      (deal.buyerName && deal.buyerName?.toLowerCase().includes(searchLower))
    );
  }
  
  return result;
};

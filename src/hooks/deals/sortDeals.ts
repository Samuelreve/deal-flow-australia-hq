
import { DealSummary } from "@/types/deal";

/**
 * Sorts deals based on a field and direction
 */
export const sortDeals = (
  deals: DealSummary[], 
  sortBy: string, 
  sortOrder: 'asc' | 'desc'
): DealSummary[] => {
  const result = [...deals];
  
  // Sort the deals
  result.sort((a, b) => {
    let valueA, valueB;
    
    // Determine which field to sort by
    switch (sortBy) {
      case "title":
        valueA = a.title.toLowerCase();
        valueB = b.title.toLowerCase();
        break;
      case "status":
        valueA = a.status;
        valueB = b.status;
        break;
      case "healthScore":
        valueA = a.healthScore;
        valueB = b.healthScore;
        break;
      case "createdAt":
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
        break;
      case "updatedAt":
      default:
        valueA = new Date(a.updatedAt).getTime();
        valueB = new Date(b.updatedAt).getTime();
    }
    
    // Apply sort order
    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });
  
  return result;
};


import { DealSummary } from "@/types/deal";

/**
 * Calculates metrics from a list of deals
 */
export const calculateMetrics = (deals: DealSummary[]) => {
  return {
    total: deals.length,
    active: deals.filter(d => d.status === "active").length,
    completed: deals.filter(d => d.status === "completed").length,
    pending: deals.filter(d => d.status === "pending").length,
    draft: deals.filter(d => d.status === "draft").length,
    cancelled: deals.filter(d => d.status === "cancelled").length,
  };
};

/**
 * Calculates the average health score of active deals
 */
export const calculateAverageHealthScore = (activeDeals: DealSummary[]) => {
  return activeDeals.length > 0 
    ? activeDeals.reduce((sum, deal) => sum + deal.healthScore, 0) / activeDeals.length 
    : 0;
};

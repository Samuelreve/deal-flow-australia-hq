
import { DealSummary } from "@/types/deal";

/**
 * Calculate various metrics from a collection of deals
 */
export const calculateMetrics = (deals: DealSummary[]) => {
  // Basic counts
  const total = deals.length;
  const active = deals.filter(d => d.status === "active").length;
  const completed = deals.filter(d => d.status === "completed").length;
  const pending = deals.filter(d => d.status === "pending").length;
  const draft = deals.filter(d => d.status === "draft").length;
  const cancelled = deals.filter(d => d.status === "cancelled").length;
  
  // Average health score (for active deals)
  const activeDeals = deals.filter(d => d.status === "active");
  const averageHealthScore = calculateAverageHealthScore(activeDeals);
  
  // Aggregated statistics
  return {
    total,
    active,
    completed,
    pending,
    draft,
    cancelled,
    averageHealthScore
  };
};

/**
 * Calculate the average health score for a collection of deals
 */
export const calculateAverageHealthScore = (deals: DealSummary[]) => {
  if (!deals.length) return 0;
  
  const sum = deals.reduce((total, deal) => total + deal.healthScore, 0);
  return Math.round(sum / deals.length);
};


import { useState, useEffect } from "react";
import { DealSummary } from "@/types/deal";
import { 
  fetchDealsFromSupabase,
  filterDeals, 
  sortDeals,
  calculateMetrics, 
  calculateAverageHealthScore 
} from "./deals";

/**
 * Hook for fetching and filtering deals
 */
export const useDeals = (userId?: string) => {
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<DealSummary[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter and sort states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("updatedAt");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch deals from Supabase
  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      const fetchedDeals = await fetchDealsFromSupabase(userId);
      setDeals(fetchedDeals);
      setLoading(false);
    };

    fetchDeals();
  }, [userId]);
  
  // Update filtered deals when dependencies change
  useEffect(() => {
    const filtered = filterDeals(deals, statusFilter, searchTerm);
    const sorted = sortDeals(filtered, sortBy, sortOrder);
    setFilteredDeals(sorted);
  }, [deals, statusFilter, searchTerm, sortBy, sortOrder]);

  // Calculate metrics
  const metrics = calculateMetrics(deals);
  
  // Get active deals and average health score
  const activeDeals = deals.filter(deal => deal.status === "active");
  const averageHealthScore = calculateAverageHealthScore(activeDeals);

  return {
    deals,
    filteredDeals,
    loading,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    metrics,
    activeDeals,
    averageHealthScore
  };
};

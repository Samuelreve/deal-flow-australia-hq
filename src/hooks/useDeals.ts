
import { useState, useEffect } from "react";
import { DealSummary } from "@/types/deal";
import { supabase } from "@/integrations/supabase/client";

// Helper to fetch deals from Supabase
const fetchDealsFromSupabase = async (userId?: string): Promise<DealSummary[]> => {
  if (!userId) {
    return [];
  }
  
  try {
    let query = supabase
      .from('deals')
      .select(`
        id,
        title,
        status,
        created_at,
        updated_at,
        health_score,
        seller_id,
        buyer_id,
        profiles!seller_id(name)
      `);
      
    // Rely on RLS to filter deals the user has access to
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching deals:', error);
      return [];
    } 
    
    if (!data) {
      return [];
    }
    
    // Format the deals from Supabase format to our app format
    return data.map(deal => ({
      id: deal.id,
      title: deal.title,
      status: deal.status,
      createdAt: new Date(deal.created_at),
      updatedAt: new Date(deal.updated_at),
      healthScore: deal.health_score,
      sellerId: deal.seller_id,
      buyerId: deal.buyer_id,
      sellerName: deal.profiles?.name || "Unknown",
      businessName: "", // Removed column that doesn't exist
    }));
  } catch (err) {
    console.error('Failed to fetch deals:', err);
    return [];
  }
};

// Helper to filter deals based on status and search term
const filterDeals = (
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

// Helper to sort deals
const sortDeals = (
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

// Helper to calculate metrics
const calculateMetrics = (deals: DealSummary[]) => {
  return {
    total: deals.length,
    active: deals.filter(d => d.status === "active").length,
    completed: deals.filter(d => d.status === "completed").length,
    pending: deals.filter(d => d.status === "pending").length,
    draft: deals.filter(d => d.status === "draft").length,
    cancelled: deals.filter(d => d.status === "cancelled").length,
  };
};

// Helper to calculate average health score
const calculateAverageHealthScore = (activeDeals: DealSummary[]) => {
  return activeDeals.length > 0 
    ? activeDeals.reduce((sum, deal) => sum + deal.healthScore, 0) / activeDeals.length 
    : 0;
};

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

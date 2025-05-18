
import { useState, useEffect } from "react";
import { DealSummary } from "@/types/deal";
import { supabase } from "@/integrations/supabase/client";

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
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
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
          setDeals([]);
        } else if (data) {
          const formattedDeals: DealSummary[] = data.map(deal => ({
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
          
          setDeals(formattedDeals);
        }
      } catch (err) {
        console.error('Failed to fetch deals:', err);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [userId]);
  
  // Filter and sort deals when dependencies change
  useEffect(() => {
    // Filter and sort deals when dependencies change
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
        (deal.buyerName && deal.buyerName.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sorting
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
    
    setFilteredDeals(result);
  }, [deals, statusFilter, searchTerm, sortBy, sortOrder]);

  // Calculate metrics for the deals
  const metrics = {
    total: deals.length,
    active: deals.filter(d => d.status === "active").length,
    completed: deals.filter(d => d.status === "completed").length,
    pending: deals.filter(d => d.status === "pending").length,
    draft: deals.filter(d => d.status === "draft").length,
    cancelled: deals.filter(d => d.status === "cancelled").length,
  };
  
  // Calculate average health score for active deals
  const activeDeals = deals.filter(deal => deal.status === "active");
  const averageHealthScore = activeDeals.length > 0 
    ? activeDeals.reduce((sum, deal) => sum + deal.healthScore, 0) / activeDeals.length 
    : 0;

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

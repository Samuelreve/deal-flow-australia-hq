
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DealSummary, DealStatus } from "@/types/deal";
import { useDeals } from "@/hooks/useDeals";
import { convertDealsToDealSummaries } from "@/utils/dealConversion";
import DealFilters from "@/components/deals/DealFilters";
import DealsTable from "@/components/deals/DealsTable";
import EmptyDealsState from "@/components/deals/EmptyDealsState";

const DealsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { deals: rawDeals, loading, error, deleteDeal } = useDeals();
  const [filteredDeals, setFilteredDeals] = useState<DealSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<DealStatus | "all">("all");
  
  // Convert deals from service format to DealSummary format
  const deals = convertDealsToDealSummaries(rawDeals);
  
  useEffect(() => {
    let filtered = deals;
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(deal => deal.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.title.toLowerCase().includes(term) ||
        (deal.sellerName && deal.sellerName.toLowerCase().includes(term)) ||
        (deal.buyerName && deal.buyerName.toLowerCase().includes(term))
      );
    }
    
    setFilteredDeals(filtered);
  }, [searchTerm, statusFilter, deals]);
  
  const canCreateDeals = user?.profile?.role === "seller" || user?.profile?.role === "admin";
  const isFiltered = searchTerm !== "" || statusFilter !== "all";
  
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Deals</h1>
          <p className="text-muted-foreground">Manage all your business transactions</p>
        </div>
        
        {canCreateDeals && (
          <Button onClick={() => navigate("/create-deal")}>
            <Plus className="h-4 w-4 mr-2" />
            New Deal
          </Button>
        )}
      </div>
      
      <DealFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      
      <div className="space-y-4">
        {filteredDeals.length === 0 ? (
          <EmptyDealsState 
            isFiltered={isFiltered} 
            canCreateDeals={canCreateDeals} 
          />
        ) : (
          <DealsTable deals={filteredDeals} totalDeals={deals.length} onDelete={deleteDeal} />
        )}
      </div>
    </AppLayout>
  );
};

export default DealsPage;

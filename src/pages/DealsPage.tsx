
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DealSummary, DealStatus } from "@/types/deal";
import { getMockDealSummariesForUser } from "@/data/mockData";
import DealFilters from "@/components/deals/DealFilters";
import DealsTable from "@/components/deals/DealsTable";
import EmptyDealsState from "@/components/deals/EmptyDealsState";

const DealsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<DealSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<DealStatus | "all">("all");
  
  useEffect(() => {
    if (user) {
      // In a real app, this would be an API call
      const userDeals = getMockDealSummariesForUser(user.id, user.profile?.role);
      setDeals(userDeals);
      setFilteredDeals(userDeals);
    }
  }, [user]);
  
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
          <DealsTable deals={filteredDeals} totalDeals={deals.length} />
        )}
      </div>
    </AppLayout>
  );
};

export default DealsPage;

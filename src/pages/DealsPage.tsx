
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 15;
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
  
  // Reset to first page when filters change (separate useEffect to avoid loop)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);
  
  // Calculate pagination
  const totalFilteredDeals = filteredDeals.length;
  const totalPages = Math.ceil(totalFilteredDeals / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDeals = filteredDeals.slice(startIndex, endIndex);
  
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
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
        {totalFilteredDeals === 0 ? (
          <EmptyDealsState 
            isFiltered={isFiltered} 
            canCreateDeals={canCreateDeals} 
          />
        ) : (
          <>
            <DealsTable 
              deals={paginatedDeals} 
              totalDeals={totalFilteredDeals}
              onDelete={deleteDeal} 
            />
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border rounded-lg bg-background">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    Showing {startIndex + 1} to {Math.min(endIndex, totalFilteredDeals)} of {totalFilteredDeals} deals
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1 px-3 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default DealsPage;

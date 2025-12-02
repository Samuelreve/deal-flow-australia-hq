
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DealsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredDeals, setFilteredDeals] = useState<DealSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<DealStatus | "all">("all");
  const [dealToDelete, setDealToDelete] = useState<string | null>(null);
  
  const dealsPerPage = 15;
  const { deals: rawDeals, totalCount, loading, error, deleteDeal } = useDeals({
    page: currentPage,
    limit: dealsPerPage
  });
  
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

  const handleDeleteDeal = (dealId: string) => {
    setDealToDelete(dealId);
  };

  const confirmDelete = async () => {
    if (dealToDelete) {
      try {
        await deleteDeal(dealToDelete);
        setDealToDelete(null);
      } catch (error) {
        console.error('Failed to delete deal:', error);
      }
    }
  };

  const cancelDelete = () => {
    setDealToDelete(null);
  };
  
  const canCreateDeals = user?.profile?.role === "seller" || user?.profile?.role === "admin";
  const isFiltered = searchTerm !== "" || statusFilter !== "all";
  
  const totalPages = Math.ceil(totalCount / dealsPerPage);
  
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Deals</h1>
            <p className="text-sm text-muted-foreground">Manage all your business transactions</p>
          </div>
          
          {canCreateDeals && (
            <Button onClick={() => navigate("/create-deal")} className="mt-4 md:mt-0">
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
        
        {filteredDeals.length === 0 ? (
          <EmptyDealsState 
            isFiltered={isFiltered} 
            canCreateDeals={canCreateDeals} 
          />
        ) : (
          <DealsTable 
            deals={filteredDeals} 
            totalDeals={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onDeleteDeal={handleDeleteDeal}
            canDelete={canCreateDeals}
          />
        )}
      </div>

      <AlertDialog open={dealToDelete !== null} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Do you really want to delete this deal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default DealsPage;

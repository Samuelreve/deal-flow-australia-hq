
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { Plus } from "lucide-react";
import { DealSummary } from "@/types/deal";
import DealsDashboard from "@/components/deals/DealsDashboard";
import DealMetrics from "@/components/dashboard/DealMetrics";
import DealFilters from "@/components/dashboard/DealFilters";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<DealSummary[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter and sort states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("updatedAt");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchDeals = async () => {
      if (!user?.id) {
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
            business_name,
            profiles:seller_id(name)
          `);
          
        // Rely on RLS to filter deals the user has access to
        // The user should only see deals where they are a participant

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
            businessName: deal.business_name, // Use the column name directly as it appears in the database
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
  }, [user]);
  
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
  
  // Calculate metrics
  const metrics = {
    total: deals.length,
    active: deals.filter(d => d.status === "active").length,
    completed: deals.filter(d => d.status === "completed").length,
    pending: deals.filter(d => d.status === "pending").length,
    draft: deals.filter(d => d.status === "draft").length,
    cancelled: deals.filter(d => d.status === "cancelled").length,
  };
  
  return (
    <AppLayout>
      <div className="mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your deal management dashboard</p>
        </div>
        
        <Button onClick={() => navigate("/deals/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Deal
        </Button>
      </div>
      
      {/* Metrics Cards */}
      <DealMetrics 
        total={metrics.total}
        active={metrics.active}
        completed={metrics.completed}
        pending={metrics.pending}
        loading={loading}
      />
      
      {/* Filters and Sorting */}
      <DealFilters 
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
      
      {/* Deals List */}
      <DealsDashboard deals={filteredDeals} />
    </AppLayout>
  );
};

export default Dashboard;

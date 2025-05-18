
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import DealsDashboard from "@/components/deals/DealsDashboard";
import DealMetrics from "@/components/dashboard/DealMetrics";
import DealFilters from "@/components/dashboard/DealFilters";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useDeals } from "@/hooks/useDeals";

const Dashboard = () => {
  const { user } = useAuth();
  const { 
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
    activeDeals,
    averageHealthScore
  } = useDeals(user?.id);
  
  return (
    <AppLayout>
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Welcome to your deal management dashboard" 
      />
      
      {/* Metrics Cards */}
      <DealMetrics 
        total={filteredDeals.length}
        active={activeDeals.length}
        completed={filteredDeals.filter(d => d.status === "completed").length}
        pending={filteredDeals.filter(d => d.status === "pending").length}
        loading={loading}
        averageHealth={averageHealthScore}
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

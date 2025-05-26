
import React from 'react';
import { useDeals } from '@/hooks/useDeals';
import { AdvancedHealthHeader } from '@/components/advanced-health/AdvancedHealthHeader';
import { HealthMonitoringTabs } from '@/components/advanced-health/HealthMonitoringTabs';

// Convert DealSummary to Deal interface for health monitoring
const transformDealsForHealthMonitoring = (deals: any[]) => {
  return deals.map(deal => ({
    ...deal,
    health_score: deal.healthScore,
    seller_id: deal.sellerId,
    created_at: deal.createdAt.toISOString(),
    updated_at: deal.updatedAt.toISOString()
  }));
};

const AdvancedHealthMonitoring = () => {
  const { deals, loading, error } = useDeals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading health monitoring data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  const transformedDeals = transformDealsForHealthMonitoring(deals);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <AdvancedHealthHeader />
      <HealthMonitoringTabs deals={transformedDeals} />
    </div>
  );
};

export default AdvancedHealthMonitoring;

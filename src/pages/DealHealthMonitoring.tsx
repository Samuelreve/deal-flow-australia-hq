
import React from 'react';
import { useDeals } from '@/hooks/useDeals';
import { DealSelector } from '@/components/advanced-health/DealSelector';
import { RealTimeHealthMonitor } from '@/components/deals/health/RealTimeHealthMonitor';

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

const DealHealthMonitoring = () => {
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deal Health Monitoring</h1>
        <p className="text-muted-foreground">
          Monitor and analyze the health of your deals in real-time
        </p>
      </div>
      
      <div className="grid gap-8">
        <DealSelector deals={transformedDeals} />
        <RealTimeHealthMonitor />
      </div>
    </div>
  );
};

export default DealHealthMonitoring;

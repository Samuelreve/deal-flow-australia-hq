
import React from 'react';
import { useDeals } from '@/hooks/useDeals';
import { HealthMetricsCard } from './HealthMetricsCard';
import { DealHealthTable } from './DealHealthTable';
import { HealthScoreChart } from './HealthScoreChart';

export interface DealHealthItem {
  id: string;
  title: string;
  status: string;
  health_score: number;
  seller_id: string;
  created_at: string;
  updated_at: string;
  riskLevel: 'low' | 'medium' | 'high';
  healthTrend: 'up' | 'down' | 'stable';
}

export const DealHealthDashboard = () => {
  const { deals, loading, error } = useDeals();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Transform DealSummary to DealHealthItem
  const healthDeals: DealHealthItem[] = deals.map(deal => ({
    id: deal.id,
    title: deal.title,
    status: deal.status,
    health_score: deal.healthScore,
    seller_id: deal.sellerId,
    created_at: deal.createdAt.toISOString(),
    updated_at: deal.updatedAt.toISOString(),
    riskLevel: deal.healthScore > 70 ? 'low' : deal.healthScore > 40 ? 'medium' : 'high',
    healthTrend: 'stable' as const
  }));

  const averageHealth = healthDeals.reduce((sum, deal) => sum + deal.health_score, 0) / healthDeals.length || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HealthMetricsCard
          title="Average Health Score"
          value={Math.round(averageHealth)}
          trend="up"
        />
        <HealthMetricsCard
          title="Deals at Risk"
          value={healthDeals.filter(d => d.riskLevel === 'high').length}
          trend="down"
        />
        <HealthMetricsCard
          title="Total Active Deals"
          value={healthDeals.filter(d => d.status === 'active').length}
          trend="stable"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthScoreChart deals={healthDeals} />
        <DealHealthTable deals={healthDeals} />
      </div>
    </div>
  );
};


import React from 'react';
import { useDeals } from '@/hooks/useDeals';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DealMetrics } from '@/components/dashboard/DealMetrics';
import { DealsTable } from '@/components/deals/DealsTable';
import { HealthScoreChart } from '@/components/dashboard/HealthScoreChart';

const Dashboard = () => {
  const { deals, loading, error, metrics } = useDeals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
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

  const recentDeals = deals
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your deals and recent activity
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Deal
        </Button>
      </div>

      {/* Metrics Cards */}
      <DealMetrics 
        total={metrics.total}
        active={metrics.active}
        completed={metrics.completed}
        draft={metrics.draft}
        averageHealthScore={metrics.averageHealthScore}
      />

      {/* Charts and Tables */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Health Score Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Health Score Trends</CardTitle>
            <CardDescription>
              Health scores for your active deals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HealthScoreChart deals={deals} />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deals</CardTitle>
            <CardDescription>
              Your most recently updated deals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDeals.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{deal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {deal.businessName || 'No business name'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Health: {deal.healthScore}%</p>
                    <p className="text-xs text-muted-foreground">{deal.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deals Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Deals</CardTitle>
          <CardDescription>
            Complete overview of your deals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DealsTable deals={deals} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

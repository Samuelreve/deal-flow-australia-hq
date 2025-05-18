
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

// Define props
interface DealMetricsProps {
  total: number;
  active: number;
  completed: number;
  draft?: number;
  pending?: number;
  cancelled?: number;
  loading?: boolean;
}

const DealMetrics: React.FC<DealMetricsProps> = ({ 
  total, 
  active, 
  completed, 
  draft = 0, 
  pending = 0, 
  cancelled = 0,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="text-sm font-medium text-muted-foreground">
            Total Deals
          </div>
          <div className="text-3xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all statuses
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-sm font-medium text-muted-foreground">
            Active Deals
          </div>
          <div className="text-3xl font-bold text-green-600">{active}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Currently in progress
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-sm font-medium text-muted-foreground">
            Completed Deals
          </div>
          <div className="text-3xl font-bold text-blue-600">{completed}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Successfully finalized
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-sm font-medium text-muted-foreground">
            Pending Actions
          </div>
          <div className="text-3xl font-bold text-amber-600">{pending}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Require your attention
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DealMetrics;

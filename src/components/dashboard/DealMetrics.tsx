
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Clock, CheckCircle, AlertCircle, Activity } from "lucide-react";

// Define props
interface DealMetricsProps {
  total: number;
  active: number;
  completed: number;
  draft?: number;
  pending?: number;
  cancelled?: number;
  loading?: boolean;
  averageHealth?: number; // New prop for average health score
}

const DealMetrics: React.FC<DealMetricsProps> = ({ 
  total, 
  active, 
  completed, 
  draft = 0, 
  pending = 0, 
  cancelled = 0,
  loading = false,
  averageHealth = 0 // Default to 0
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        {[1, 2, 3, 4, 5].map(i => (
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

  const getHealthColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
      <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div className="text-sm font-medium text-muted-foreground">
              Total Deals
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="text-3xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all statuses
          </p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div className="text-sm font-medium text-muted-foreground">
              Active Deals
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-green-600">{active}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Currently in progress
          </p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div className="text-sm font-medium text-muted-foreground">
              Completed Deals
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600">{completed}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Successfully finalized
          </p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-amber-500">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div className="text-sm font-medium text-muted-foreground">
              Pending Actions
            </div>
            <div className="bg-amber-100 p-2 rounded-full">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-600">{pending}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Require your attention
          </p>
        </CardContent>
      </Card>

      {/* New Card for Average Health Score */}
      <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-400">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div className="text-sm font-medium text-muted-foreground">
              Average Health Score
            </div>
            <div className={`bg-${getHealthColor(averageHealth).replace('text-', '')}-100 p-2 rounded-full`}>
              <AlertCircle className={`h-4 w-4 ${getHealthColor(averageHealth)}`} />
            </div>
          </div>
          <div className={`text-3xl font-bold ${getHealthColor(averageHealth)}`}>
            {averageHealth.toFixed(0)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            For active deals
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DealMetrics;

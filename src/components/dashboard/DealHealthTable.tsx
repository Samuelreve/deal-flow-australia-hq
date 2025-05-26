
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DealHealthItem {
  id: string;
  title: string;
  status: string;
  health_score: number;
  riskLevel: 'low' | 'medium' | 'high';
  healthTrend: 'up' | 'down' | 'stable';
}

interface DealHealthTableProps {
  deals: DealHealthItem[];
}

export const DealHealthTable: React.FC<DealHealthTableProps> = ({ deals }) => {
  const getRiskBadgeVariant = (riskLevel: string): "default" | "outline" | "secondary" | "destructive" => {
    switch (riskLevel) {
      case 'high': return "destructive";
      case 'medium': return "default";
      case 'low': return "secondary";
      default: return "outline";
    }
  };

  const getHealthColor = (score: number): string => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Health Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deals.slice(0, 5).map((deal) => (
            <div key={deal.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{deal.title}</h4>
                <p className="text-sm text-muted-foreground">Status: {deal.status}</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`text-lg font-bold ${getHealthColor(deal.health_score)}`}>
                  {deal.health_score}%
                </div>
                <Badge variant={getRiskBadgeVariant(deal.riskLevel)}>
                  {deal.riskLevel.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DealHealthTable;

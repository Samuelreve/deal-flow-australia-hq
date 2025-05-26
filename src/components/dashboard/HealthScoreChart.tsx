
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DealHealthItem {
  id: string;
  title: string;
  status: string;
  health_score: number;
  riskLevel: 'low' | 'medium' | 'high';
  healthTrend: 'up' | 'down' | 'stable';
}

interface HealthScoreChartProps {
  deals: DealHealthItem[];
}

export const HealthScoreChart: React.FC<HealthScoreChartProps> = ({ deals }) => {
  const chartData = deals.slice(0, 10).map(deal => ({
    name: deal.title.substring(0, 15) + '...',
    score: deal.health_score,
    fill: deal.health_score >= 75 ? '#10b981' : deal.health_score >= 50 ? '#f59e0b' : '#ef4444'
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Score Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="score" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default HealthScoreChart;


import React, { useMemo } from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { DealSummary } from "@/types/deal";

interface HealthScoreOverviewChartProps {
  deals: DealSummary[];
}

const HealthScoreOverviewChart: React.FC<HealthScoreOverviewChartProps> = ({ deals }) => {
  const chartData = useMemo(() => {
    // Filter for active deals
    const activeDeals = deals.filter(deal => deal.status === 'active');
    if (activeDeals.length === 0) return [];
    
    // Count deals by risk level
    const highRisk = activeDeals.filter(d => d.healthScore < 50).length;
    const mediumRisk = activeDeals.filter(d => d.healthScore >= 50 && d.healthScore < 75).length;
    const lowRisk = activeDeals.filter(d => d.healthScore >= 75).length;
    
    return [
      { name: 'High Risk', value: highRisk, color: '#ef4444' },
      { name: 'Medium Risk', value: mediumRisk, color: '#f59e0b' },
      { name: 'Low Risk', value: lowRisk, color: '#10b981' }
    ].filter(item => item.value > 0);
  }, [deals]);
  
  // Calculate average health score
  const averageScore = useMemo(() => {
    const activeDeals = deals.filter(deal => deal.status === 'active');
    if (activeDeals.length === 0) return 0;
    
    const totalScore = activeDeals.reduce((sum, deal) => sum + deal.healthScore, 0);
    return Math.round(totalScore / activeDeals.length);
  }, [deals]);
  
  const getScoreColor = (score: number) => {
    if (score < 50) return '#ef4444';
    if (score < 75) return '#f59e0b';
    return '#10b981';
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[400px]">
      <Card className="md:col-span-2 flex flex-col">
        <CardContent className="flex-1 min-h-0 pt-6">
          {chartData.length > 0 ? (
            <ChartContainer
              config={{
                highRisk: { color: '#ef4444' },
                mediumRisk: { color: '#f59e0b' },
                lowRisk: { color: '#10b981' }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={true}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No active deals to display</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="flex flex-col justify-center items-center py-10">
        <div className="text-5xl font-bold mb-4" style={{ color: getScoreColor(averageScore) }}>
          {averageScore}%
        </div>
        <div className="text-muted-foreground text-center">
          <h3 className="text-lg font-medium mb-1">Average Health Score</h3>
          <p className="text-sm">Based on {deals.filter(deal => deal.status === 'active').length} active deals</p>
        </div>
      </Card>
    </div>
  );
};

export default HealthScoreOverviewChart;

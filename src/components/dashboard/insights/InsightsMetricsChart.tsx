
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface InsightMetric {
  name: string;
  value: number;
  color?: string;
}

interface InsightsMetricsChartProps {
  title: string;
  description?: string;
  metrics: InsightMetric[];
  height?: number;
}

const InsightsMetricsChart = ({ 
  title, 
  description, 
  metrics, 
  height = 250 
}: InsightsMetricsChartProps) => {
  // Don't render chart if no metrics
  if (!metrics || metrics.length === 0) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 bg-muted/30 rounded-md">
            <p className="text-muted-foreground">No metrics available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Default colors for metrics if not specified
  const defaultColors = [
    "#4f46e5", // indigo
    "#0ea5e9", // sky
    "#8b5cf6", // violet
    "#10b981", // emerald
    "#f97316"  // orange
  ];
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={metrics} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              dx={-5}
            />
            <Tooltip 
              formatter={(value) => [`${value}`, 'Value']} 
              contentStyle={{ 
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {metrics.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || defaultColors[index % defaultColors.length]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default InsightsMetricsChart;

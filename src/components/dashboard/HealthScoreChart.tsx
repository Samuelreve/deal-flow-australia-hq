
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface HealthScoreRange {
  range: string;
  count: number;
}

interface HealthScoreChartProps {
  data: HealthScoreRange[];
}

const HealthScoreChart: React.FC<HealthScoreChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted/30 rounded-md">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Define colors for different health score ranges
  const getBarColor = (range: string) => {
    switch(range) {
      case "0-25": return "#ef4444";  // red
      case "26-50": return "#f97316"; // orange
      case "51-75": return "#f59e0b"; // amber
      case "76-100": return "#22c55e"; // green
      default: return "#4f46e5"; // indigo
    }
  };

  return (
    <ResponsiveContainer width="100%" height={250} className="mt-4">
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
          dataKey="range" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          dy={10}
        />
        <YAxis 
          allowDecimals={false} 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          dx={-5}
        />
        <Tooltip 
          formatter={(value) => [`${value} deals`, 'Count']} 
          contentStyle={{ 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.range)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default HealthScoreChart;

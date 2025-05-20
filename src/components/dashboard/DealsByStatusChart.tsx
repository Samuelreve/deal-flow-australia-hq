
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface DealsByStatusChartProps {
  data: ChartDataItem[];
}

const DealsByStatusChart: React.FC<DealsByStatusChartProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted/30 rounded-md">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  const totalDeals = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height={250} className="mt-4">
      <PieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          onMouseEnter={onPieEnter}
          onMouseLeave={onPieLeave}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value} deals (${Math.round((Number(value) / totalDeals) * 100)}%)`, 'Count']} 
          contentStyle={{ 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DealsByStatusChart;

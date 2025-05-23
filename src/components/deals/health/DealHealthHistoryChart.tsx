
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useHealthHistory } from "@/hooks/useHealthHistory";
import { format } from 'date-fns';

interface DealHealthHistoryChartProps {
  dealId: string;
}

const DealHealthHistoryChart: React.FC<DealHealthHistoryChartProps> = ({ dealId }) => {
  const { history, loading, deal } = useHealthHistory(dealId);
  const [chartData, setChartData] = useState<Array<any>>([]);
  
  useEffect(() => {
    if (history && history.length > 0) {
      // Transform history data for the chart
      const formattedData = history.map(item => ({
        date: format(new Date(item.created_at), 'MMM dd'),
        score: item.health_score,
        // Include tooltip data
        tooltipData: {
          previousScore: item.previous_score,
          changeReason: item.change_reason,
          fullDate: format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')
        }
      }));
      
      setChartData(formattedData);
    }
  }, [history]);
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health History</CardTitle>
          <CardDescription>Loading health history...</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {deal ? `Health History: ${deal.title}` : 'Health History'}
        </CardTitle>
        <CardDescription>
          Historical health score changes over time
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {chartData.length > 1 ? (
          <ChartContainer
            config={{
              healthScore: { color: '#3b82f6' }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, props) => {
                        const tooltipData = props.payload.tooltipData;
                        return [
                          <div key="score">
                            <span className="font-medium">Score: </span>
                            <span>{value}%</span>
                          </div>,
                          tooltipData.previousScore && (
                            <div key="change">
                              <span className="font-medium">Change: </span>
                              <span>{value - tooltipData.previousScore}%</span>
                            </div>
                          ),
                          tooltipData.changeReason && (
                            <div key="reason">
                              <span className="font-medium">Reason: </span>
                              <span>{tooltipData.changeReason}</span>
                            </div>
                          ),
                          <div key="date">
                            <span className="font-medium">Date: </span>
                            <span>{tooltipData.fullDate}</span>
                          </div>
                        ];
                      }}
                    />
                  }
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4 }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">Not enough history data to display chart</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DealHealthHistoryChart;

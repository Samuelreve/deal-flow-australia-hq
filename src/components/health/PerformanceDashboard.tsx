
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity,
  Filter,
  Download
} from "lucide-react";
import { DealSummary } from "@/types/deal";

interface PerformanceDashboardProps {
  deals: DealSummary[];
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ deals }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');

  const chartData = useMemo(() => {
    // Group deals by health score ranges
    const ranges = [
      { name: '90-100%', range: [90, 100], color: '#10b981' },
      { name: '70-89%', range: [70, 89], color: '#3b82f6' },
      { name: '50-69%', range: [50, 69], color: '#f59e0b' },
      { name: '30-49%', range: [30, 49], color: '#ef4444' },
      { name: '0-29%', range: [0, 29], color: '#991b1b' }
    ];

    return ranges.map(range => ({
      name: range.name,
      count: deals.filter(deal => 
        deal.healthScore >= range.range[0] && deal.healthScore <= range.range[1]
      ).length,
      fill: range.color
    }));
  }, [deals]);

  const trendData = useMemo(() => {
    // Simulate historical data for the last 30 days
    const days = 30;
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Calculate average health score for this "day" (simulated)
      const avgScore = deals.length > 0 
        ? deals.reduce((sum, deal) => sum + deal.healthScore, 0) / deals.length + (Math.random() - 0.5) * 10
        : 0;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        avgHealthScore: Math.max(0, Math.min(100, avgScore)),
        dealsCount: deals.length + Math.floor(Math.random() * 3) - 1
      });
    }
    
    return data;
  }, [deals]);

  const statusData = useMemo(() => {
    const statusCounts = deals.reduce((acc, deal) => {
      acc[deal.status] = (acc[deal.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      'draft': '#6b7280',
      'active': '#3b82f6',
      'pending': '#f59e0b',
      'completed': '#10b981',
      'cancelled': '#ef4444'
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      fill: colors[status as keyof typeof colors] || '#6b7280'
    }));
  }, [deals]);

  const metrics = useMemo(() => {
    const totalDeals = deals.length;
    const avgHealthScore = totalDeals > 0 
      ? deals.reduce((sum, deal) => sum + deal.healthScore, 0) / totalDeals 
      : 0;
    const healthyDeals = deals.filter(deal => deal.healthScore >= 70).length;
    const atRiskDeals = deals.filter(deal => deal.healthScore < 50).length;

    return {
      totalDeals,
      avgHealthScore: Math.round(avgHealthScore),
      healthyDeals,
      atRiskDeals,
      healthyPercentage: totalDeals > 0 ? Math.round((healthyDeals / totalDeals) * 100) : 0,
      atRiskPercentage: totalDeals > 0 ? Math.round((atRiskDeals / totalDeals) * 100) : 0
    };
  }, [deals]);

  const exportData = () => {
    const csvContent = [
      ['Deal Title', 'Health Score', 'Status', 'Created Date'],
      ...deals.map(deal => [
        deal.title,
        deal.healthScore.toString(),
        deal.status,
        deal.createdAt.toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deal-health-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="avgHealthScore" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="avgHealthScore" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
          </AreaChart>
        );
      default:
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" />
          </BarChart>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive analytics for your deal health</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Deals</p>
                <p className="text-2xl font-bold">{metrics.totalDeals}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Health Score</p>
                <p className="text-2xl font-bold">{metrics.avgHealthScore}%</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Healthy Deals</p>
                <p className="text-2xl font-bold text-green-600">{metrics.healthyPercentage}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-red-600">{metrics.atRiskPercentage}%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="distribution">Health Distribution</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="status">Status Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Health Score Distribution</CardTitle>
                  <CardDescription>Number of deals by health score range</CardDescription>
                </div>
                
                <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                {renderChart()}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Health Score Trends</CardTitle>
              <CardDescription>Average health score over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgHealthScore" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Deal Status Overview</CardTitle>
              <CardDescription>Distribution of deals by status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;

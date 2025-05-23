
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { BarChart3, Plus, Calendar } from "lucide-react";
import { DealSummary } from "@/types/deal";
import { HealthScoreComparison } from "@/types/advancedHealthMonitoring";
import { useAuth } from "@/contexts/AuthContext";

interface HealthComparisonToolProps {
  deals: DealSummary[];
  comparisons: HealthScoreComparison[];
  onCreateComparison: (comparison: Omit<HealthScoreComparison, 'id' | 'created_at'>) => Promise<any>;
}

const HealthComparisonTool: React.FC<HealthComparisonToolProps> = ({
  deals,
  comparisons,
  onCreateComparison
}) => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState<string>('');
  const [newComparison, setNewComparison] = useState({
    comparison_name: '',
    deal_ids: [] as string[],
    date_range_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    date_range_end: new Date().toISOString().split('T')[0]
  });

  const handleCreateComparison = async () => {
    if (!user?.id || !newComparison.comparison_name.trim() || newComparison.deal_ids.length === 0) {
      return;
    }

    await onCreateComparison({
      user_id: user.id,
      comparison_name: newComparison.comparison_name,
      deal_ids: newComparison.deal_ids,
      date_range_start: newComparison.date_range_start,
      date_range_end: newComparison.date_range_end
    });

    setNewComparison({
      comparison_name: '',
      deal_ids: [],
      date_range_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      date_range_end: new Date().toISOString().split('T')[0]
    });
    setIsCreating(false);
  };

  const generateMockComparisonData = (comparison: HealthScoreComparison) => {
    // Mock data generation for demonstration
    const dealData = comparison.deal_ids.map(dealId => {
      const deal = deals.find(d => d.id === dealId);
      return {
        dealName: deal?.title || 'Unknown Deal',
        currentScore: deal?.healthScore || 0,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        change: Math.floor(Math.random() * 20) - 10
      };
    });

    return dealData;
  };

  const selectedComparisonData = selectedComparison 
    ? comparisons.find(c => c.id === selectedComparison)
    : null;

  const chartData = selectedComparisonData 
    ? generateMockComparisonData(selectedComparisonData)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Health Score Comparison
          </div>
          <Button 
            size="sm" 
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Comparison
          </Button>
        </CardTitle>
        <CardDescription>
          Compare health scores across multiple deals over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isCreating && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-4">
              <div>
                <Label htmlFor="comparison-name">Comparison Name</Label>
                <Input
                  id="comparison-name"
                  placeholder="e.g., Q1 Active Deals"
                  value={newComparison.comparison_name}
                  onChange={(e) => setNewComparison(prev => ({ 
                    ...prev, 
                    comparison_name: e.target.value 
                  }))}
                />
              </div>
              
              <div>
                <Label>Select Deals to Compare</Label>
                <div className="mt-2 grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {deals.slice(0, 10).map((deal) => (
                    <label key={deal.id} className="flex items-center gap-2 p-2 border rounded">
                      <input
                        type="checkbox"
                        checked={newComparison.deal_ids.includes(deal.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewComparison(prev => ({
                              ...prev,
                              deal_ids: [...prev.deal_ids, deal.id]
                            }));
                          } else {
                            setNewComparison(prev => ({
                              ...prev,
                              deal_ids: prev.deal_ids.filter(id => id !== deal.id)
                            }));
                          }
                        }}
                      />
                      <span className="text-sm">{deal.title}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {deal.healthScore}%
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newComparison.date_range_start}
                    onChange={(e) => setNewComparison(prev => ({ 
                      ...prev, 
                      date_range_start: e.target.value 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newComparison.date_range_end}
                    onChange={(e) => setNewComparison(prev => ({ 
                      ...prev, 
                      date_range_end: e.target.value 
                    }))}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCreateComparison} size="sm">
                  Create Comparison
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreating(false)} 
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {comparisons.length > 0 && (
          <div className="mb-4">
            <Label>Select Comparison to View</Label>
            <Select value={selectedComparison} onValueChange={setSelectedComparison}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a comparison" />
              </SelectTrigger>
              <SelectContent>
                {comparisons.map((comparison) => (
                  <SelectItem key={comparison.id} value={comparison.id}>
                    {comparison.comparison_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedComparisonData ? (
          <div className="space-y-4">
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  score: { color: '#3b82f6' }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dealName" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="currentScore" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chartData.map((deal, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="font-medium truncate">{deal.dealName}</div>
                  <div className="text-2xl font-bold">{deal.currentScore}%</div>
                  <div className={`text-sm ${deal.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {deal.change >= 0 ? '+' : ''}{deal.change}% from period start
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {comparisons.length === 0 
              ? "Create your first comparison to visualize deal health trends"
              : "Select a comparison to view the analysis"
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthComparisonTool;

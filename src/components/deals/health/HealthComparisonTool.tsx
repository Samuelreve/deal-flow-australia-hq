import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart3 } from "lucide-react";
import { DealSummary } from "@/types/deal";
import { HealthScoreComparison } from '@/types/advancedHealthMonitoring';

interface HealthComparisonToolProps {
  deals: DealSummary[];
  comparisons: HealthScoreComparison[];
  onCreateComparison: (comparison: Omit<HealthScoreComparison, 'id' | 'created_at'>) => Promise<HealthScoreComparison | null>;
}

const HealthComparisonTool: React.FC<HealthComparisonToolProps> = ({
  deals,
  comparisons,
  onCreateComparison
}) => {
  const [comparisonName, setComparisonName] = useState('');
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleDealSelection = (dealId: string, checked: boolean) => {
    if (checked) {
      setSelectedDeals(prev => [...prev, dealId]);
    } else {
      setSelectedDeals(prev => prev.filter(id => id !== dealId));
    }
  };

  const handleCreateComparison = async () => {
    if (!comparisonName || selectedDeals.length < 2) return;
    
    setIsCreating(true);
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      await onCreateComparison({
        user_id: '', // Will be set by the hook
        comparison_name: comparisonName,
        deal_ids: selectedDeals,
        date_range_start: thirtyDaysAgo.toISOString(),
        date_range_end: now.toISOString()
      });
      
      setComparisonName('');
      setSelectedDeals([]);
    } catch (error) {
      console.error('Error creating comparison:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Health Comparison Tool
        </CardTitle>
        <CardDescription>
          Compare health scores across multiple deals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New Comparison */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-medium">Create New Comparison</h4>
          
          <div>
            <Label htmlFor="comparison-name">Comparison Name</Label>
            <Input
              id="comparison-name"
              value={comparisonName}
              onChange={(e) => setComparisonName(e.target.value)}
              placeholder="e.g., Q4 Active Deals Comparison"
            />
          </div>
          
          <div>
            <Label>Select Deals to Compare (minimum 2)</Label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
              {deals.map((deal) => (
                <div key={deal.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`deal-${deal.id}`}
                    checked={selectedDeals.includes(deal.id)}
                    onCheckedChange={(checked) => handleDealSelection(deal.id, checked as boolean)}
                  />
                  <Label htmlFor={`deal-${deal.id}`} className="text-sm">
                    {deal.title} ({deal.healthScore}%)
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={handleCreateComparison} 
            disabled={isCreating || !comparisonName || selectedDeals.length < 2}
            className="w-full"
          >
            {isCreating ? 'Creating...' : 'Create Comparison'}
          </Button>
        </div>

        {/* Existing Comparisons */}
        <div className="space-y-3">
          <h4 className="font-medium">Recent Comparisons</h4>
          {comparisons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comparisons created yet.</p>
          ) : (
            comparisons.slice(0, 5).map((comparison) => (
              <div key={comparison.id} className="border rounded-lg p-3">
                <p className="font-medium">{comparison.comparison_name}</p>
                <p className="text-sm text-muted-foreground">
                  {Array.isArray(comparison.deal_ids) ? comparison.deal_ids.length : 0} deals compared
                </p>
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(comparison.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthComparisonTool;

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Plus } from "lucide-react";
import { CustomHealthMetric } from '@/types/advancedHealthMonitoring';

interface CustomMetricsManagerProps {
  dealId: string;
  metrics: CustomHealthMetric[];
  onCreateMetric: (metric: Omit<CustomHealthMetric, 'id' | 'created_at' | 'updated_at'>) => Promise<CustomHealthMetric | null>;
}

const CustomMetricsManager: React.FC<CustomMetricsManagerProps> = ({ 
  dealId, 
  metrics, 
  onCreateMetric 
}) => {
  const [newMetric, setNewMetric] = useState({
    metric_name: '',
    metric_weight: 1.0,
    current_value: 0,
    target_value: 100,
    is_active: true
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateMetric = async () => {
    if (!newMetric.metric_name) return;
    
    setIsCreating(true);
    try {
      await onCreateMetric({
        deal_id: dealId,
        user_id: '', // Will be set by the hook
        ...newMetric
      });
      
      setNewMetric({
        metric_name: '',
        metric_weight: 1.0,
        current_value: 0,
        target_value: 100,
        is_active: true
      });
    } catch (error) {
      console.error('Error creating metric:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const dealMetrics = metrics.filter(m => m.deal_id === dealId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Custom Metrics
        </CardTitle>
        <CardDescription>
          Define and track custom health metrics for this deal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New Metric */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-medium flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Metric
          </h4>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="metric-name">Metric Name</Label>
              <Input
                id="metric-name"
                value={newMetric.metric_name}
                onChange={(e) => setNewMetric(prev => ({ ...prev, metric_name: e.target.value }))}
                placeholder="e.g., Document Completion Rate"
              />
            </div>
            
            <div>
              <Label htmlFor="metric-weight">Weight (0-1)</Label>
              <Input
                id="metric-weight"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={newMetric.metric_weight}
                onChange={(e) => setNewMetric(prev => ({ ...prev, metric_weight: parseFloat(e.target.value) || 1.0 }))}
              />
            </div>
            
            <div>
              <Label htmlFor="current-value">Current Value</Label>
              <Input
                id="current-value"
                type="number"
                value={newMetric.current_value}
                onChange={(e) => setNewMetric(prev => ({ ...prev, current_value: parseInt(e.target.value) || 0 }))}
              />
            </div>
            
            <div>
              <Label htmlFor="target-value">Target Value</Label>
              <Input
                id="target-value"
                type="number"
                value={newMetric.target_value}
                onChange={(e) => setNewMetric(prev => ({ ...prev, target_value: parseInt(e.target.value) || 100 }))}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is-active"
              checked={newMetric.is_active}
              onCheckedChange={(checked) => setNewMetric(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is-active">Active</Label>
          </div>
          
          <Button onClick={handleCreateMetric} disabled={isCreating || !newMetric.metric_name}>
            {isCreating ? 'Creating...' : 'Create Metric'}
          </Button>
        </div>

        {/* Existing Metrics */}
        <div className="space-y-3">
          <h4 className="font-medium">Existing Metrics</h4>
          {dealMetrics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No custom metrics defined for this deal.</p>
          ) : (
            dealMetrics.map((metric) => (
              <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{metric.metric_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {metric.current_value}/{metric.target_value} (Weight: {metric.metric_weight})
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {Math.round((metric.current_value / metric.target_value) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {metric.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomMetricsManager;

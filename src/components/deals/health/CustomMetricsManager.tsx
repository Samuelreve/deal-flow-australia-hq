
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Settings, Trash2 } from "lucide-react";
import { CustomHealthMetric } from "@/types/advancedHealthMonitoring";
import { useAuth } from "@/contexts/AuthContext";

interface CustomMetricsManagerProps {
  dealId: string;
  metrics: CustomHealthMetric[];
  onCreateMetric: (metric: Omit<CustomHealthMetric, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
}

const CustomMetricsManager: React.FC<CustomMetricsManagerProps> = ({ 
  dealId, 
  metrics, 
  onCreateMetric 
}) => {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [newMetric, setNewMetric] = useState({
    metric_name: '',
    metric_weight: 0.1,
    current_value: 50,
    target_value: 80
  });

  const handleCreateMetric = async () => {
    if (!user?.id || !newMetric.metric_name.trim()) return;

    await onCreateMetric({
      deal_id: dealId,
      user_id: user.id,
      metric_name: newMetric.metric_name,
      metric_weight: newMetric.metric_weight,
      current_value: newMetric.current_value,
      target_value: newMetric.target_value,
      is_active: true
    });

    setNewMetric({
      metric_name: '',
      metric_weight: 0.1,
      current_value: 50,
      target_value: 80
    });
    setIsAdding(false);
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Custom Health Metrics
          </div>
          <Button 
            size="sm" 
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Metric
          </Button>
        </CardTitle>
        <CardDescription>
          Define custom metrics that contribute to the overall health score
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-4">
              <div>
                <Label htmlFor="metric-name">Metric Name</Label>
                <Input
                  id="metric-name"
                  placeholder="e.g., Communication Quality"
                  value={newMetric.metric_name}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, metric_name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label>Weight ({Math.round(newMetric.metric_weight * 100)}%)</Label>
                <Slider
                  value={[newMetric.metric_weight]}
                  onValueChange={(value) => setNewMetric(prev => ({ ...prev, metric_weight: value[0] }))}
                  max={1}
                  step={0.05}
                  className="mt-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Value</Label>
                  <Slider
                    value={[newMetric.current_value]}
                    onValueChange={(value) => setNewMetric(prev => ({ ...prev, current_value: value[0] }))}
                    max={100}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    {newMetric.current_value}%
                  </div>
                </div>
                
                <div>
                  <Label>Target Value</Label>
                  <Slider
                    value={[newMetric.target_value]}
                    onValueChange={(value) => setNewMetric(prev => ({ ...prev, target_value: value[0] }))}
                    max={100}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    {newMetric.target_value}%
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCreateMetric} size="sm">
                  Create Metric
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAdding(false)} 
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {metrics.filter(m => m.deal_id === dealId).map((metric) => (
            <div key={metric.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{metric.metric_name}</span>
                  <Badge variant="outline">
                    {Math.round(metric.metric_weight * 100)}% weight
                  </Badge>
                </div>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress: {metric.current_value}% / {metric.target_value}%</span>
                  <span className="text-muted-foreground">
                    {Math.round((metric.current_value / metric.target_value) * 100)}% of target
                  </span>
                </div>
                <Progress 
                  value={(metric.current_value / metric.target_value) * 100} 
                  className="h-2"
                  indicatorClassName={getProgressColor(metric.current_value, metric.target_value)}
                />
              </div>
            </div>
          ))}
          
          {metrics.filter(m => m.deal_id === dealId).length === 0 && !isAdding && (
            <div className="text-center py-8 text-muted-foreground">
              No custom metrics defined yet. Add your first metric to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomMetricsManager;

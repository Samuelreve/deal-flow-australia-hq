
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useHealthThresholds } from '@/hooks/useHealthThresholds';
import { HealthThreshold } from '@/types/healthMonitoring';

interface HealthThresholdSettingsProps {
  dealId: string;
}

const HealthThresholdSettings: React.FC<HealthThresholdSettingsProps> = ({ dealId }) => {
  const { thresholds, loading, updateThreshold, toggleThreshold } = useHealthThresholds(dealId);

  const getThresholdIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getThresholdColor = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'outline';
    }
  };

  const handleThresholdChange = (threshold: HealthThreshold, newValue: number) => {
    updateThreshold(threshold.id, { threshold_value: newValue });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Alert Thresholds</CardTitle>
          <CardDescription>Loading threshold settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Health Alert Thresholds
        </CardTitle>
        <CardDescription>
          Configure when you want to be notified about deal health changes
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {thresholds.map((threshold) => (
          <div key={threshold.id} className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getThresholdIcon(threshold.threshold_type)}
                <span className="font-medium capitalize">{threshold.threshold_type}</span>
                <Badge variant={getThresholdColor(threshold.threshold_type) as any}>
                  {threshold.threshold_value}%
                </Badge>
              </div>
              
              <Switch
                checked={threshold.is_enabled}
                onCheckedChange={(checked) => toggleThreshold(threshold.id, checked)}
              />
            </div>
            
            {threshold.is_enabled && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Alert when health drops below:</span>
                  <span>{threshold.threshold_value}%</span>
                </div>
                
                <Slider
                  value={[threshold.threshold_value]}
                  onValueChange={(values) => handleThresholdChange(threshold, values[0])}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default HealthThresholdSettings;

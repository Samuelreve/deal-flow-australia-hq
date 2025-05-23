
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HealthThreshold {
  id: string;
  type: 'critical' | 'warning' | 'info';
  value: number;
  enabled: boolean;
}

const HealthThresholdManager = () => {
  const [thresholds, setThresholds] = useState<HealthThreshold[]>([
    { id: '1', type: 'critical', value: 30, enabled: true },
    { id: '2', type: 'warning', value: 50, enabled: true },
    { id: '3', type: 'info', value: 70, enabled: true }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleThresholdChange = (id: string, field: keyof HealthThreshold, value: any) => {
    setThresholds(prev => 
      prev.map(threshold => 
        threshold.id === id ? { ...threshold, [field]: value } : threshold
      )
    );
  };

  const addThreshold = () => {
    const newThreshold: HealthThreshold = {
      id: Date.now().toString(),
      type: 'info',
      value: 60,
      enabled: true
    };
    setThresholds(prev => [...prev, newThreshold]);
  };

  const removeThreshold = (id: string) => {
    setThresholds(prev => prev.filter(threshold => threshold.id !== id));
  };

  const saveThresholds = () => {
    // In a real app, this would save to the database
    setIsEditing(false);
    toast({
      title: "Thresholds saved",
      description: "Your health threshold settings have been updated.",
    });
  };

  const getThresholdColor = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Health Thresholds
        </CardTitle>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={saveThresholds}>
                Save
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {thresholds.map((threshold) => (
          <div key={threshold.id} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={getThresholdColor(threshold.type) as any}>
                  {threshold.type.toUpperCase()}
                </Badge>
                <Switch
                  checked={threshold.enabled}
                  onCheckedChange={(checked) => 
                    handleThresholdChange(threshold.id, 'enabled', checked)
                  }
                  disabled={!isEditing}
                />
              </div>
              
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Alert when health drops below:</Label>
                  <Input
                    type="number"
                    value={threshold.value}
                    onChange={(e) => 
                      handleThresholdChange(threshold.id, 'value', parseInt(e.target.value))
                    }
                    className="w-20"
                    min="0"
                    max="100"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Alert when health drops below {threshold.value}%
                </p>
              )}
            </div>
            
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeThreshold(threshold.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        {isEditing && (
          <Button
            variant="outline"
            onClick={addThreshold}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Threshold
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthThresholdManager;

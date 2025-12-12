
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Settings, Loader2 } from 'lucide-react';
import { useHealthThresholds } from '@/hooks/useHealthThresholds';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HealthThresholdManagerProps {
  dealId?: string;
  userId?: string;
}

const HealthThresholdManager: React.FC<HealthThresholdManagerProps> = ({ dealId, userId }) => {
  // Pass dealId directly - hook now handles undefined/global cases properly
  const { thresholds, loading, updateThreshold, toggleThreshold, refetch } = useHealthThresholds(dealId);
  const [isEditing, setIsEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newThreshold, setNewThreshold] = useState<{
    type: 'critical' | 'warning' | 'info';
    value: number;
  }>({
    type: 'warning',
    value: 50
  });

  const handleAddThreshold = async () => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase
        .from('deal_health_thresholds')
        .insert({
          deal_id: dealId,
          user_id: userId,
          threshold_type: newThreshold.type,
          threshold_value: newThreshold.value,
          is_enabled: true
        });

      if (error) throw error;

      toast.success('Threshold added successfully');
      refetch();
      setNewThreshold({ type: 'warning', value: 50 });
    } catch (error) {
      console.error('Error adding threshold:', error);
      toast.error('Failed to add threshold');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveThreshold = async (thresholdId: string) => {
    try {
      const { error } = await supabase
        .from('deal_health_thresholds')
        .delete()
        .eq('id', thresholdId);

      if (error) throw error;

      toast.success('Threshold removed');
      refetch();
    } catch (error) {
      console.error('Error removing threshold:', error);
      toast.error('Failed to remove threshold');
    }
  };

  const handleUpdateValue = async (thresholdId: string, value: number) => {
    await updateThreshold(thresholdId, { threshold_value: value });
  };

  const handleUpdateType = async (thresholdId: string, type: 'critical' | 'warning' | 'info') => {
    await updateThreshold(thresholdId, { threshold_type: type });
  };

  const getThresholdColor = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Health Thresholds
        </CardTitle>
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Done' : 'Edit'}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {thresholds.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No thresholds configured</p>
            <p className="text-sm">Add thresholds to receive alerts when health scores drop</p>
          </div>
        ) : (
          thresholds.map((threshold) => (
            <div key={threshold.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <Select 
                      value={threshold.threshold_type}
                      onValueChange={(value: 'critical' | 'warning' | 'info') => handleUpdateType(threshold.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={getThresholdColor(threshold.threshold_type) as any}>
                      {threshold.threshold_type.toUpperCase()}
                    </Badge>
                  )}
                  <Switch
                    checked={threshold.is_enabled}
                    onCheckedChange={(checked) => toggleThreshold(threshold.id, checked)}
                  />
                </div>
                
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Alert when health drops below:</Label>
                    <Input
                      type="number"
                      value={threshold.threshold_value}
                      onChange={(e) => handleUpdateValue(threshold.id, parseInt(e.target.value) || 0)}
                      className="w-20"
                      min="0"
                      max="100"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Alert when health drops below {threshold.threshold_value}%
                    {!threshold.is_enabled && ' (disabled)'}
                  </p>
                )}
              </div>
              
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveThreshold(threshold.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}
        
        {isEditing && (
          <div className="border-2 border-dashed rounded-lg p-4 space-y-4">
            <p className="text-sm font-medium">Add New Threshold</p>
            <div className="flex items-center gap-4">
              <Select 
                value={newThreshold.type}
                onValueChange={(value: 'critical' | 'warning' | 'info') => 
                  setNewThreshold(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <Label className="text-sm">Below:</Label>
                <Input
                  type="number"
                  value={newThreshold.value}
                  onChange={(e) => setNewThreshold(prev => ({ 
                    ...prev, 
                    value: parseInt(e.target.value) || 0 
                  }))}
                  className="w-20"
                  min="0"
                  max="100"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              
              <Button
                onClick={handleAddThreshold}
                disabled={adding}
                className="ml-auto"
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthThresholdManager;

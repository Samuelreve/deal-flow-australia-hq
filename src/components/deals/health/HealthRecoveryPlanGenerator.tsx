import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, Target } from "lucide-react";
import { HealthRecoveryPlan } from '@/types/advancedHealthMonitoring';

interface HealthRecoveryPlanGeneratorProps {
  dealId: string;
  currentScore: number;
  recoveryPlans: HealthRecoveryPlan[];
  onCreatePlan: (plan: Omit<HealthRecoveryPlan, 'id' | 'created_at' | 'updated_at'>) => Promise<HealthRecoveryPlan | null>;
}

const HealthRecoveryPlanGenerator: React.FC<HealthRecoveryPlanGeneratorProps> = ({
  dealId,
  currentScore,
  recoveryPlans,
  onCreatePlan
}) => {
  const [targetScore, setTargetScore] = useState(85);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePlan = async () => {
    if (targetScore <= currentScore) return;
    
    setIsCreating(true);
    try {
      const actionItems = [
        {
          id: `action-${Date.now()}-1`,
          title: 'Complete pending document reviews',
          description: 'Review and approve all outstanding documents',
          priority: 'high' as const,
          estimated_impact: 15,
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completed: false
        },
        {
          id: `action-${Date.now()}-2`,
          title: 'Schedule stakeholder meeting',
          description: 'Organize meeting with key stakeholders',
          priority: 'medium' as const,
          estimated_impact: 10,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completed: false
        }
      ];

      await onCreatePlan({
        deal_id: dealId,
        user_id: '', // Will be set by the hook
        current_score: currentScore,
        target_score: targetScore,
        estimated_timeline_days: 14,
        action_items: actionItems,
        status: 'active'
      });
    } catch (error) {
      console.error('Error creating recovery plan:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const dealPlans = recoveryPlans.filter(p => p.deal_id === dealId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Recovery Plan Generator
        </CardTitle>
        <CardDescription>
          Create actionable plans to improve deal health
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New Plan */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Create Recovery Plan
          </h4>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Current Score</Label>
              <Input value={`${currentScore}%`} disabled />
            </div>
            
            <div>
              <Label htmlFor="target-score">Target Score</Label>
              <Input
                id="target-score"
                type="number"
                min={currentScore + 1}
                max="100"
                value={targetScore}
                onChange={(e) => setTargetScore(parseInt(e.target.value) || 85)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleCreatePlan} 
            disabled={isCreating || targetScore <= currentScore}
            className="w-full"
          >
            {isCreating ? 'Creating Plan...' : 'Generate Recovery Plan'}
          </Button>
        </div>

        {/* Existing Plans */}
        <div className="space-y-3">
          <h4 className="font-medium">Existing Plans</h4>
          {dealPlans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recovery plans created yet.</p>
          ) : (
            dealPlans.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">
                      {plan.current_score}% → {plan.target_score}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {plan.estimated_timeline_days} days estimated
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    plan.status === 'active' ? 'bg-green-100 text-green-800' :
                    plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {plan.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.action_items.length} action items
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthRecoveryPlanGenerator;


import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Plus, Target, Calendar, CheckCircle } from "lucide-react";
import { HealthRecoveryPlan } from "@/types/advancedHealthMonitoring";
import { useAuth } from "@/contexts/AuthContext";

interface HealthRecoveryPlanGeneratorProps {
  dealId: string;
  currentScore: number;
  recoveryPlans: HealthRecoveryPlan[];
  onCreatePlan: (plan: Omit<HealthRecoveryPlan, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
}

const HealthRecoveryPlanGenerator: React.FC<HealthRecoveryPlanGeneratorProps> = ({
  dealId,
  currentScore,
  recoveryPlans,
  onCreatePlan
}) => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlan, setNewPlan] = useState({
    target_score: Math.min(currentScore + 20, 100),
    estimated_timeline_days: 30,
    action_items: [] as any[]
  });

  const suggestedActions = [
    {
      title: "Improve Communication",
      description: "Set up daily standup meetings with all stakeholders",
      priority: "high" as const,
      estimated_impact: 15
    },
    {
      title: "Update Documentation",
      description: "Ensure all deal documents are current and accessible",
      priority: "medium" as const,
      estimated_impact: 10
    },
    {
      title: "Resolve Blockers",
      description: "Identify and address any blockers preventing progress",
      priority: "high" as const,
      estimated_impact: 20
    },
    {
      title: "Stakeholder Alignment",
      description: "Schedule alignment meeting with key decision makers",
      priority: "medium" as const,
      estimated_impact: 12
    },
    {
      title: "Risk Assessment",
      description: "Conduct comprehensive risk assessment and mitigation planning",
      priority: "low" as const,
      estimated_impact: 8
    }
  ];

  const handleGeneratePlan = async () => {
    if (!user?.id) return;

    const selectedActions = suggestedActions.map((action, index) => ({
      id: `action_${index}`,
      ...action,
      due_date: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false
    }));

    await onCreatePlan({
      deal_id: dealId,
      user_id: user.id,
      current_score: currentScore,
      target_score: newPlan.target_score,
      estimated_timeline_days: newPlan.estimated_timeline_days,
      action_items: selectedActions,
      status: 'active'
    });

    setIsCreating(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activePlans = recoveryPlans.filter(plan => 
    plan.deal_id === dealId && plan.status === 'active'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Health Recovery Plans
          </div>
          <Button 
            size="sm" 
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            <Plus className="h-4 w-4 mr-1" />
            Generate Plan
          </Button>
        </CardTitle>
        <CardDescription>
          AI-generated action plans to improve deal health scores
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isCreating && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Score</Label>
                  <div className="text-2xl font-bold text-muted-foreground">
                    {currentScore}%
                  </div>
                </div>
                <div>
                  <Label htmlFor="target-score">Target Score</Label>
                  <Input
                    id="target-score"
                    type="number"
                    min={currentScore}
                    max={100}
                    value={newPlan.target_score}
                    onChange={(e) => setNewPlan(prev => ({ 
                      ...prev, 
                      target_score: parseInt(e.target.value) 
                    }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="timeline">Estimated Timeline (days)</Label>
                <Input
                  id="timeline"
                  type="number"
                  min={1}
                  max={365}
                  value={newPlan.estimated_timeline_days}
                  onChange={(e) => setNewPlan(prev => ({ 
                    ...prev, 
                    estimated_timeline_days: parseInt(e.target.value) 
                  }))}
                />
              </div>
              
              <div>
                <Label>Suggested Action Items</Label>
                <div className="mt-2 space-y-2">
                  {suggestedActions.map((action, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded">
                      <Checkbox defaultChecked />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{action.title}</span>
                          <Badge className={getPriorityColor(action.priority)}>
                            {action.priority}
                          </Badge>
                          <Badge variant="outline">
                            +{action.estimated_impact}% impact
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleGeneratePlan} size="sm">
                  Generate Recovery Plan
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

        <div className="space-y-4">
          {activePlans.map((plan) => (
            <div key={plan.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="font-medium">
                    Target: {plan.target_score}% (from {plan.current_score}%)
                  </span>
                </div>
                <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                  {plan.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {plan.estimated_timeline_days} days estimated
                </div>
                <div className="text-sm text-muted-foreground">
                  {plan.action_items.filter(item => item.completed).length} / {plan.action_items.length} completed
                </div>
              </div>
              
              <div className="space-y-2">
                {plan.action_items.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className={`h-4 w-4 ${item.completed ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                      {item.title}
                    </span>
                    <Badge size="sm" className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                  </div>
                ))}
                {plan.action_items.length > 3 && (
                  <div className="text-sm text-muted-foreground">
                    +{plan.action_items.length - 3} more actions
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {activePlans.length === 0 && !isCreating && (
            <div className="text-center py-8 text-muted-foreground">
              No active recovery plans. Generate one to improve your deal health.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthRecoveryPlanGenerator;

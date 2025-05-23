
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Wrench, 
  Target, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  Calendar
} from "lucide-react";
import { DealSummary } from "@/types/deal";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecoveryAction {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
  estimatedDays: number;
  completed: boolean;
  dueDate?: string;
}

interface RecoveryPlan {
  id: string;
  dealId: string;
  currentScore: number;
  targetScore: number;
  estimatedTimelineDays: number;
  actions: RecoveryAction[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

interface RecoveryPlanGeneratorProps {
  deals: DealSummary[];
  userId?: string;
}

const RecoveryPlanGenerator: React.FC<RecoveryPlanGeneratorProps> = ({ deals, userId }) => {
  const [recoveryPlans, setRecoveryPlans] = useState<RecoveryPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<string>('');
  const [targetScore, setTargetScore] = useState<number>(85);

  const generateRecoveryPlan = async (dealId: string, target: number) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const deal = deals.find(d => d.id === dealId);
      if (!deal) return;

      const currentScore = deal.healthScore;
      if (currentScore >= target) {
        toast.info('Deal is already at or above target score');
        return;
      }

      const scoreDifference = target - currentScore;
      
      // Generate recovery actions based on score difference
      const actions: RecoveryAction[] = [
        {
          id: 'action-1',
          title: 'Complete pending document reviews',
          description: 'Review and approve all outstanding documents to improve completion rates',
          priority: 'high',
          estimatedImpact: Math.min(15, scoreDifference * 0.3),
          estimatedDays: 3,
          completed: false,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          id: 'action-2',
          title: 'Schedule stakeholder alignment meeting',
          description: 'Organize a meeting with all key stakeholders to address concerns',
          priority: 'high',
          estimatedImpact: Math.min(12, scoreDifference * 0.25),
          estimatedDays: 5,
          completed: false,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          id: 'action-3',
          title: 'Update project timeline',
          description: 'Revise milestones and deadlines to be more realistic',
          priority: 'medium',
          estimatedImpact: Math.min(10, scoreDifference * 0.2),
          estimatedDays: 2,
          completed: false,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          id: 'action-4',
          title: 'Implement weekly progress reports',
          description: 'Set up regular reporting to improve transparency',
          priority: 'medium',
          estimatedImpact: Math.min(8, scoreDifference * 0.15),
          estimatedDays: 7,
          completed: false,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          id: 'action-5',
          title: 'Address communication gaps',
          description: 'Establish clear communication channels and response times',
          priority: 'low',
          estimatedImpact: Math.min(5, scoreDifference * 0.1),
          estimatedDays: 14,
          completed: false,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ];

      const totalEstimatedImpact = actions.reduce((sum, action) => sum + action.estimatedImpact, 0);
      const estimatedTimelineDays = Math.max(...actions.map(a => a.estimatedDays));

      const newPlan: RecoveryPlan = {
        id: `plan-${Date.now()}`,
        dealId,
        currentScore,
        targetScore: target,
        estimatedTimelineDays,
        actions: actions.filter(action => action.estimatedImpact > 0),
        status: 'active',
        createdAt: new Date()
      };

      // Save to database
      const { error } = await supabase
        .from('health_recovery_plans')
        .insert({
          deal_id: dealId,
          user_id: userId,
          current_score: currentScore,
          target_score: target,
          estimated_timeline_days: estimatedTimelineDays,
          action_items: newPlan.actions.map(action => ({
            id: action.id,
            title: action.title,
            description: action.description,
            priority: action.priority,
            estimated_impact: action.estimatedImpact,
            due_date: action.dueDate,
            completed: action.completed
          })),
          status: 'active'
        });

      if (error) throw error;

      setRecoveryPlans(prev => [newPlan, ...prev]);
      toast.success(`Recovery plan created! Estimated improvement: +${Math.round(totalEstimatedImpact)}%`);
    } catch (error) {
      console.error('Error generating recovery plan:', error);
      toast.error('Failed to generate recovery plan');
    } finally {
      setLoading(false);
    }
  };

  const toggleActionComplete = async (planId: string, actionId: string) => {
    setRecoveryPlans(prev => prev.map(plan => {
      if (plan.id === planId) {
        const updatedActions = plan.actions.map(action => 
          action.id === actionId ? { ...action, completed: !action.completed } : action
        );
        return { ...plan, actions: updatedActions };
      }
      return plan;
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const calculatePlanProgress = (plan: RecoveryPlan) => {
    const completedActions = plan.actions.filter(a => a.completed).length;
    return (completedActions / plan.actions.length) * 100;
  };

  const getEstimatedCurrentScore = (plan: RecoveryPlan) => {
    const completedImpact = plan.actions
      .filter(a => a.completed)
      .reduce((sum, action) => sum + action.estimatedImpact, 0);
    return Math.min(100, plan.currentScore + completedImpact);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Recovery Plan Generator
        </CardTitle>
        <CardDescription>
          Create actionable plans to improve deal health scores
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Plan Creation */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <Label htmlFor="deal-select">Select Deal</Label>
            <select
              id="deal-select"
              value={selectedDeal}
              onChange={(e) => setSelectedDeal(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Choose a deal...</option>
              {deals.filter(d => d.healthScore < 90).map(deal => (
                <option key={deal.id} value={deal.id}>
                  {deal.title} ({deal.healthScore}%)
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-1">
            <Label htmlFor="target-score">Target Score</Label>
            <Input
              id="target-score"
              type="number"
              min="1"
              max="100"
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
            />
          </div>
          
          <div className="md:col-span-1 flex items-end">
            <Button
              onClick={() => selectedDeal && generateRecoveryPlan(selectedDeal, targetScore)}
              disabled={!selectedDeal || loading}
              className="w-full flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              {loading ? 'Generating...' : 'Create Plan'}
            </Button>
          </div>
        </div>

        {/* Recovery Plans */}
        <div className="space-y-4">
          {recoveryPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recovery plans created yet</p>
              <p className="text-sm">Select a deal and create your first recovery plan</p>
            </div>
          ) : (
            recoveryPlans.map((plan) => {
              const deal = deals.find(d => d.id === plan.dealId);
              if (!deal) return null;

              const progress = calculatePlanProgress(plan);
              const estimatedScore = getEstimatedCurrentScore(plan);

              return (
                <Card key={plan.id} className="border-primary/20">
                  <CardContent className="p-6">
                    {/* Plan Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{deal.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Recovery Plan • Created {plan.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">Progress:</span>
                          <Badge variant="outline">{Math.round(progress)}%</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {plan.estimatedTimelineDays} days
                        </div>
                      </div>
                    </div>

                    {/* Score Progress */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{plan.currentScore}%</div>
                        <div className="text-xs text-muted-foreground">Starting Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{Math.round(estimatedScore)}%</div>
                        <div className="text-xs text-muted-foreground">Current Est.</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{plan.targetScore}%</div>
                        <div className="text-xs text-muted-foreground">Target Score</div>
                      </div>
                    </div>

                    <Progress value={progress} className="mb-6" />

                    <Separator className="my-4" />

                    {/* Action Items */}
                    <div>
                      <h5 className="font-medium mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Action Items ({plan.actions.filter(a => a.completed).length}/{plan.actions.length})
                      </h5>
                      
                      <div className="space-y-3">
                        {plan.actions.map((action) => (
                          <div key={action.id} className="flex items-start gap-3 p-3 border rounded-lg">
                            <Checkbox
                              checked={action.completed}
                              onCheckedChange={() => toggleActionComplete(plan.id, action.id)}
                              className="mt-1"
                            />
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-1">
                                <h6 className={`font-medium ${action.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {action.title}
                                </h6>
                                <div className="flex items-center gap-2">
                                  <Badge variant={getPriorityColor(action.priority) as any}>
                                    {action.priority}
                                  </Badge>
                                  <span className="text-sm text-green-600">+{Math.round(action.estimatedImpact)}%</span>
                                </div>
                              </div>
                              
                              <p className={`text-sm mb-2 ${action.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                                {action.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Due: {action.dueDate}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {action.estimatedDays} days
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecoveryPlanGenerator;

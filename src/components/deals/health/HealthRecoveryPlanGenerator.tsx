
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, ArrowRight, CheckCircle2 } from "lucide-react";
import { format } from 'date-fns';
import { HealthRecoveryPlan } from "@/types/advancedHealthMonitoring";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetScore, setTargetScore] = useState(Math.min(currentScore + 20, 100));
  const [selectedPlan, setSelectedPlan] = useState<HealthRecoveryPlan | null>(null);
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    estimated_impact: 5
  });

  const activePlan = recoveryPlans.find(p => p.deal_id === dealId && p.status === 'active');
  
  const handleGeneratePlan = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      const actionItems = [
        {
          id: crypto.randomUUID(),
          title: 'Review all blocked milestones',
          description: 'Identify and address issues with any blocked milestones to improve progress',
          priority: 'high' as const,
          estimated_impact: 15,
          due_date: format(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          completed: false
        },
        {
          id: crypto.randomUUID(),
          title: 'Schedule progress meeting with all participants',
          description: 'Get all stakeholders on the same page and clarify next steps',
          priority: 'medium' as const,
          estimated_impact: 10,
          due_date: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          completed: false
        },
        {
          id: crypto.randomUUID(),
          title: 'Update milestone documentation',
          description: 'Ensure all milestone documentation is up-to-date and clear',
          priority: 'low' as const,
          estimated_impact: 5,
          due_date: format(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          completed: false
        }
      ];
      
      const plan = {
        deal_id: dealId,
        user_id: 'current-user-id', // This would be replaced with auth.uid() in real implementation
        current_score: currentScore,
        target_score: targetScore,
        estimated_timeline_days: 14,
        action_items: actionItems,
        status: 'active' as const
      };
      
      await onCreatePlan(plan);
      
    } catch (error) {
      console.error('Error generating recovery plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleAddAction = () => {
    if (!selectedPlan) return;
    
    const updatedPlan = {
      ...selectedPlan,
      action_items: [
        ...selectedPlan.action_items,
        {
          id: crypto.randomUUID(),
          title: newAction.title,
          description: newAction.description,
          priority: newAction.priority,
          estimated_impact: newAction.estimated_impact,
          due_date: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          completed: false
        }
      ]
    };
    
    // This would update the plan in the database in a real implementation
    setSelectedPlan(updatedPlan);
    setNewAction({
      title: '',
      description: '',
      priority: 'medium',
      estimated_impact: 5
    });
  };
  
  const handleToggleAction = (actionId: string) => {
    if (!selectedPlan) return;
    
    const updatedActionItems = selectedPlan.action_items.map(action => {
      if (action.id === actionId) {
        return { ...action, completed: !action.completed };
      }
      return action;
    });
    
    const updatedPlan = {
      ...selectedPlan,
      action_items: updatedActionItems
    };
    
    // This would update the plan in the database in a real implementation
    setSelectedPlan(updatedPlan);
  };
  
  const handleRemoveAction = (actionId: string) => {
    if (!selectedPlan) return;
    
    const updatedActionItems = selectedPlan.action_items.filter(action => action.id !== actionId);
    
    const updatedPlan = {
      ...selectedPlan,
      action_items: updatedActionItems
    };
    
    // This would update the plan in the database in a real implementation
    setSelectedPlan(updatedPlan);
  };
  
  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Health Recovery Plan</CardTitle>
        <CardDescription>
          Generate an action plan to improve your deal's health score
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!activePlan && !selectedPlan && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Current Health Score:</span>
                <span className="font-medium">{currentScore}%</span>
              </div>
              
              <div className="flex justify-between">
                <span>Target Health Score:</span>
                <span className="font-medium">{targetScore}%</span>
              </div>
              
              <Slider 
                value={[targetScore]}
                min={currentScore}
                max={100}
                step={1}
                onValueChange={(values) => setTargetScore(values[0])}
                className="mt-2"
              />
              
              <div className="text-sm text-muted-foreground">
                Target improvement: +{targetScore - currentScore}%
              </div>
            </div>
            
            <Button 
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generating Plan...' : 'Generate Recovery Plan'}
            </Button>
          </div>
        )}
        
        {(activePlan || selectedPlan) && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-muted-foreground">Current Score</div>
                <div className="text-2xl font-bold">{currentScore}%</div>
              </div>
              
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              
              <div>
                <div className="text-sm text-muted-foreground">Target Score</div>
                <div className="text-2xl font-bold">{selectedPlan?.target_score || activePlan?.target_score}%</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Action Items</h3>
              
              {(selectedPlan?.action_items || activePlan?.action_items || []).map((action) => (
                <div key={action.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div 
                    className={`w-5 h-5 rounded-full flex items-center justify-center cursor-pointer ${action.completed ? 'bg-green-500 text-white' : 'border'}`}
                    onClick={() => handleToggleAction(action.id)}
                  >
                    {action.completed && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${action.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {action.title}
                      </h4>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveAction(action.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className={getPriorityColor(action.priority)}>
                        {action.priority}
                      </Badge>
                      <Badge variant="outline">Impact: +{action.estimated_impact}%</Badge>
                      {action.due_date && (
                        <Badge variant="outline">Due: {action.due_date}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Add New Action</h4>
              <div className="space-y-3">
                <Input 
                  placeholder="Action title"
                  value={newAction.title}
                  onChange={(e) => setNewAction(prev => ({ ...prev, title: e.target.value }))}
                />
                <Input 
                  placeholder="Description"
                  value={newAction.description}
                  onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="flex items-center gap-2">
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={newAction.priority}
                    onChange={(e) => setNewAction(prev => ({ 
                      ...prev, 
                      priority: e.target.value as 'low' | 'medium' | 'high'
                    }))}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <Button onClick={handleAddAction}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthRecoveryPlanGenerator;

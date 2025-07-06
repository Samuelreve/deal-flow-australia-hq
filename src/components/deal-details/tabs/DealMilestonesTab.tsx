import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Clock, AlertCircle, Lightbulb, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Milestone {
  id: string;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  due_date?: string;
  completed_at?: string;
  order_index: number;
}

interface DealMilestonesTabProps {
  dealId: string;
}

const DealMilestonesTab: React.FC<DealMilestonesTabProps> = ({ dealId }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMilestones();
  }, [dealId]);

  const fetchMilestones = async () => {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('deal_id', dealId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching milestones:', error);
        toast({
          title: "Error",
          description: "Failed to load milestones",
          variant: "destructive"
        });
        return;
      }

      setMilestones(data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'blocked':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'in_progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'blocked': 'bg-red-100 text-red-800 border-red-200',
      'not_started': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || colors.not_started}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with AI Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Deal Milestones</h3>
          <p className="text-sm text-muted-foreground">Track progress through key deal stages</p>
        </div>
        <Button className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI Suggest Next Action
        </Button>
      </div>

      {/* Milestones Timeline */}
      <div className="space-y-4">
        {milestones.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No milestones found for this deal.</p>
              <p className="text-sm text-muted-foreground mt-2">Milestones will help track the progress of your deal.</p>
            </CardContent>
          </Card>
        ) : (
          milestones.map((milestone, index) => (
            <Card key={milestone.id} className="relative">
              {/* Timeline connector line */}
              {index < milestones.length - 1 && (
                <div className="absolute left-8 top-16 w-0.5 h-8 bg-border"></div>
              )}
              
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(milestone.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{milestone.title}</h4>
                          {getStatusBadge(milestone.status)}
                          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs">
                            <Lightbulb className="h-3 w-3" />
                            Explain with AI
                          </Button>
                        </div>
                        
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                        )}
                      </div>
                      
                      <div className="text-right text-sm text-muted-foreground">
                        {milestone.due_date && (
                          <div>Due: {formatDate(milestone.due_date)}</div>
                        )}
                        {milestone.completed_at && (
                          <div className="text-green-600">
                            Completed: {formatDate(milestone.completed_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DealMilestonesTab;

import React from 'react';
import { AlertCircle, Check, TrendingUp, Lightbulb, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InsightItem {
  title: string;
  description: string;
  type: string;
  priority: string;
}

interface InsightsCategoriesProps {
  insights: InsightItem[];
  showEmpty?: boolean;
}

const InsightsCategories = ({ insights, showEmpty = true }: InsightsCategoriesProps) => {
  // Group insights by type for better organization
  const highPriority = insights.filter(i => i.priority === 'high');
  const positiveInsights = insights.filter(i => i.type === 'positive' && i.priority !== 'high');
  const upcomingDeadlines = insights.filter(i => i.type === 'deadline');
  
  // If no insights and showEmpty is false, don't render
  if (insights.length === 0 && !showEmpty) {
    return null;
  }
  
  return (
    <div className="space-y-6 my-4">
      {insights.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No insights available at this time.</p>
        </div>
      ) : (
        <>
          {highPriority.length > 0 && (
            <InsightCategory 
              title="Needs Attention" 
              items={highPriority} 
              icon={<AlertCircle className="h-5 w-5 text-destructive" />}
              badgeVariant="destructive"
            />
          )}
          
          {positiveInsights.length > 0 && (
            <InsightCategory 
              title="Progressing Well" 
              items={positiveInsights} 
              icon={<Check className="h-5 w-5 text-green-500" />}
              badgeVariant="success"
            />
          )}
          
          {upcomingDeadlines.length > 0 && (
            <InsightCategory 
              title="Upcoming Deadlines" 
              items={upcomingDeadlines} 
              icon={<Clock className="h-5 w-5 text-amber-500" />}
              badgeVariant="warning"
            />
          )}
        </>
      )}
    </div>
  );
};

interface InsightCategoryProps {
  title: string;
  items: InsightItem[];
  icon: React.ReactNode;
  badgeVariant: "default" | "destructive" | "outline" | "secondary" | "success" | "warning";
}

const InsightCategory = ({ title, items, icon, badgeVariant }: InsightCategoryProps) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="text-md font-semibold">{title}</h3>
    </div>
    <div className="space-y-3 pl-7">
      {items.map((item, index) => (
        <div key={index} className="border-l-2 pl-4 pb-1 border-muted">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{item.title}</h4>
            <Badge variant={badgeVariant}>{item.priority}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
      ))}
    </div>
  </div>
);

export default InsightsCategories;

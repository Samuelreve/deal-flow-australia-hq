
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Milestone } from "@/types/deal";
import { cn } from "@/lib/utils";

interface DealProgressProps {
  milestones: Milestone[];
}

const DealProgress = ({ milestones }: DealProgressProps) => {
  return (
    <div className="space-y-6">
      {milestones.map((milestone, index) => (
        <div key={milestone.id} className="relative">
          {index < milestones.length - 1 && (
            <div className="absolute left-3 top-6 h-full w-0.5 bg-border" />
          )}
          <div className="flex items-start gap-4">
            <div className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full mt-1",
              milestone.status === "completed" 
                ? "bg-deal-completed text-white" 
                : milestone.status === "in_progress" 
                  ? "bg-deal-active text-white" 
                  : "bg-border text-foreground"
            )}>
              <span className="text-xs">{index + 1}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">{milestone.title}</h3>
                <Badge variant="outline">
                  {milestone.status === "completed" ? "Completed" : 
                   milestone.status === "in_progress" ? "In Progress" : 
                   milestone.status === "blocked" ? "Blocked" : "Not Started"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
              
              {milestone.dueDate && (
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  Due {milestone.dueDate.toLocaleDateString()}
                </div>
              )}
              
              {milestone.status === "in_progress" && (
                <div className="mt-4">
                  <Button size="sm">Continue</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DealProgress;

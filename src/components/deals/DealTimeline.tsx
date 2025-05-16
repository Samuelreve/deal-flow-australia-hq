
import { FileText, Users } from "lucide-react";
import { Deal, Milestone } from "@/types/deal";

interface DealTimelineProps {
  deal: Deal;
}

const DealTimeline = ({ deal }: DealTimelineProps) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">Deal created</p>
          <p className="text-sm text-muted-foreground">
            {new Intl.DateTimeFormat("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "numeric"
            }).format(deal.createdAt)}
          </p>
        </div>
      </div>
      
      {deal.milestones.filter(m => m.status === "completed").map(milestone => (
        <div key={milestone.id} className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-deal-completed/20 text-deal-completed flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">{milestone.title} completed</p>
            <p className="text-sm text-muted-foreground">
              {milestone.completedAt && new Intl.DateTimeFormat("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "numeric",
                minute: "numeric"
              }).format(milestone.completedAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DealTimeline;

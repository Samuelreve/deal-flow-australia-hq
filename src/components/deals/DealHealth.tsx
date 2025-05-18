
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface DealHealthProps {
  healthScore: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const DealHealth = ({ 
  healthScore, 
  showLabel = true, 
  size = 'md' 
}: DealHealthProps) => {
  // Helper function to determine color based on health score
  const getHealthColorClass = (score: number) => {
    if (score < 30) return "bg-red-500";
    if (score < 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Helper to determine health status text
  const getHealthStatusText = (score: number) => {
    if (score < 30) return "At Risk";
    if (score < 60) return "Needs Attention";
    if (score < 85) return "On Track";
    return "Excellent";
  };

  // Determine height based on size prop
  const getProgressHeight = () => {
    switch(size) {
      case 'sm': return "h-1.5";
      case 'lg': return "h-3";
      default: return "h-2";
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <Progress 
          value={healthScore} 
          className={`${getProgressHeight()} flex-1`} 
          indicatorClassName={cn(getHealthColorClass(healthScore))} 
        />
        <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium`}>{healthScore}%</span>
      </div>
      {showLabel && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Based on milestone progress</p>
          
          <div className="flex items-center">
            <span className="text-xs font-medium mr-1">{getHealthStatusText(healthScore)}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p className="text-xs">
                    Deal health is calculated based on milestone progress:
                    <br />• Completed milestones add points
                    <br />• In-progress milestones add some points
                    <br />• Blocked milestones reduce points
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
    </>
  );
};

export default DealHealth;

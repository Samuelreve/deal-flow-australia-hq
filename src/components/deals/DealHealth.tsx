
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DealHealthProps {
  healthScore: number;
}

const DealHealth = ({ healthScore }: DealHealthProps) => {
  // Helper function to determine color based on health score
  const getHealthColorClass = (score: number) => {
    if (score < 30) return "bg-red-500";
    if (score < 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <Progress 
          value={healthScore} 
          className="h-2 flex-1" 
          indicatorClassName={cn(getHealthColorClass(healthScore))} 
        />
        <span className="text-sm font-medium">{healthScore}%</span>
      </div>
      <p className="text-xs text-muted-foreground">Based on progress and activity</p>
    </>
  );
};

export default DealHealth;
